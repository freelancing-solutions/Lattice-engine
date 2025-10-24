mutation_engine/api/endpoints/search.py

```python
@router.get("/search/specs")
async def search_specs(
    query: str,
    limit: int = 10,
    project_id: Optional[str] = None,
    user: User = Depends(get_current_user),
    search_service: SearchService = Depends()
):
    """Search for specs using semantic search"""
    
    # Verify user has access to project if specified
    if project_id:
        await verify_project_access(user, project_id)
    
    results = await search_service.search(query, limit, project_id)
    
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }

@router.get("/search/mutations")
async def search_mutations(
    query: str,
    limit: int = 10,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    user: User = Depends(get_current_user)
):
    """Search for mutations with semantic search"""
    
    # Generate query embedding
    embedding_service = EmbeddingService(settings.openai_api_key)
    query_embedding = await embedding_service.generate_embedding(query)
    
    # Search mutations
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutations = await repo.semantic_search(
            query_embedding,
            limit=limit,
            project_id=project_id,
            status=status
        )
    
    return {
        "query": query,
        "results": mutations,
        "count": len(mutations)
    }

@router.post("/search/reindex")
async def reindex_specs(
    project_id: Optional[str] = None,
    user: User = Depends(PermissionChecker(Permission.PROJECT_UPDATE)),
    search_service: SearchService = Depends()
):
    """Reindex specs for search (admin operation)"""
    
    async with db.get_session() as session:
        repo = SpecRepository(session)
        
        if project_id:
            specs = await repo.get_by_project(project_id)
        else:
            specs = await repo.get_all()
        
        indexed_count = 0
        for spec in specs:
            try:
                await search_service.index_spec(spec)
                indexed_count += 1
            except Exception as e:
                logger.error(f"Failed to index spec {spec.id}: {e}")
    
    return {
        "message": f"Reindexed {indexed_count} specs",
        "count": indexed_count
    }

@router.get("/search/similar/{spec_id}")
async def find_similar_specs(
    spec_id: str,
    limit: int = 5,
    user: User = Depends(get_current_user),
    search_service: SearchService = Depends()
):
    """Find specs similar to a given spec"""
    
    # Get the spec
    async with db.get_session() as session:
        repo = SpecRepository(session)
        spec = await repo.get_by_id(spec_id)
        
        if not spec:
            raise HTTPException(404, "Spec not found")
        
        # Verify access
        await verify_project_access(user, spec.project_id)
    
    # Use spec content as query
    spec_text = f"{spec.name}\n{spec.description}\n{spec.content}"
    results = await search_service.search(spec_text, limit)
    
    # Filter out the original spec
    results = [r for r in results if r["spec_id"] != spec_id]
    
    return {
        "spec_id": spec_id,
        "similar_specs": results,
        "count": len(results)
    }

# Task 6.7: Search Tests
# Location: /tests/test_search.py

@pytest.mark.asyncio
async def test_qdrant_indexing():
    """Test indexing spec in Qdrant"""
    qdrant = QdrantService(url="http://localhost:6333")
    spec = create_test_spec()
    embedding = [0.1] * 1536  # Mock embedding
    
    await qdrant.index_spec(spec, embedding)
    
    # Verify indexed
    results = await qdrant.search_similar_specs(embedding, limit=1)
    assert len(results) == 1
    assert results[0]["spec_id"] == spec.id

@pytest.mark.asyncio
async def test_semantic_search():
    """Test semantic search functionality"""
    search_service = create_test_search_service()
    
    # Index test specs
    spec1 = Spec(id="1", name="User Authentication", content="Login and signup")
    spec2 = Spec(id="2", name="Payment Processing", content="Stripe integration")
    
    await search_service.index_spec(spec1)
    await search_service.index_spec(spec2)
    
    # Search for authentication
    results = await search_service.search("user login system")
    
    assert len(results) > 0
    assert results[0]["spec_id"] == "1"  # Should match auth spec

@pytest.mark.asyncio
async def test_pgvector_similarity():
    """Test pgvector similarity search"""
    pgvector = PgVectorService(db_service)
    
    query_embedding = [0.2] * 1536
    results = await pgvector.search_similar(query_embedding, limit=5)
    
    assert isinstance(results, list)
    for result in results:
        assert "spec_id" in result
        assert "score" in result
        assert 0 <= result["score"] <= 1
```

---

### **Sprint 4: Mutation Application & Conflict Resolution (Weeks 7-8)**

#### Week 7: Mutation Application Logic

**Day 1-2: Mutation Executor**
```python
# Task 7.1: Mutation Executor Service
# Location: /lattice_mutation_engine/execution/mutation_executor.py

from typing import List, Dict, Any
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"

class ExecutionResult(BaseModel):
    mutation_id: str
    status: ExecutionStatus
    executed_changes: List[str] = []
    failed_changes: List[str] = []
    errors: List[Dict[str, Any]] = []
    rollback_available: bool = True
    execution_time: float = 0.0

class MutationExecutor:
    """Execute mutations and apply changes"""
    
    def __init__(
        self,
        spec_storage: "SpecStorage",
        neo4j_service: "Neo4jService"
    ):
        self.spec_storage = spec_storage
        self.neo4j = neo4j_service
        self.change_handlers = self._register_handlers()
    
    def _register_handlers(self) -> Dict[str, "ChangeHandler"]:
        """Register handlers for different change types"""
        return {
            "create": CreateChangeHandler(),
            "modify": ModifyChangeHandler(),
            "delete": DeleteChangeHandler(),
            "rename": RenameChangeHandler()
        }
    
    async def execute_mutation(
        self,
        mutation: Mutation,
        dry_run: bool = False
    ) -> ExecutionResult:
        """Execute mutation changes"""
        
        result = ExecutionResult(
            mutation_id=mutation.id,
            status=ExecutionStatus.IN_PROGRESS
        )
        
        start_time = time.time()
        
        try:
            # Create execution snapshot for rollback
            snapshot = await self._create_snapshot(mutation)
            
            # Execute each change
            for change in mutation.changes:
                try:
                    handler = self.change_handlers.get(change.operation_type)
                    if not handler:
                        raise ValueError(f"Unknown operation: {change.operation_type}")
                    
                    if not dry_run:
                        await handler.execute(change, self.spec_storage)
                        result.executed_changes.append(change.id)
                    else:
                        # Validate change without applying
                        await handler.validate(change, self.spec_storage)
                
                except Exception as e:
                    logger.error(f"Failed to execute change {change.id}: {e}")
                    result.failed_changes.append(change.id)
                    result.errors.append({
                        "change_id": change.id,
                        "error": str(e),
                        "traceback": traceback.format_exc()
                    })
                    
                    # Stop execution on first failure
                    break
            
            # Update mutation status
            if result.failed_changes:
                result.status = ExecutionStatus.FAILED
                
                # Rollback if not dry run
                if not dry_run:
                    await self._rollback(mutation, snapshot, result)
            else:
                result.status = ExecutionStatus.COMPLETED
                
                # Update graph
                if not dry_run:
                    await self._update_graph(mutation)
            
            result.execution_time = time.time() - start_time
            
            return result
        
        except Exception as e:
            logger.error(f"Mutation execution failed: {e}")
            result.status = ExecutionStatus.FAILED
            result.errors.append({
                "error": str(e),
                "traceback": traceback.format_exc()
            })
            return result
    
    async def _create_snapshot(self, mutation: Mutation) -> Dict[str, Any]:
        """Create snapshot of current state for rollback"""
        snapshot = {
            "mutation_id": mutation.id,
            "timestamp": datetime.utcnow().isoformat(),
            "specs": {},
            "graph_state": {}
        }
        
        # Snapshot affected specs
        for change in mutation.changes:
            spec_id = change.metadata.get("spec_id")
            if spec_id and spec_id not in snapshot["specs"]:
                spec = await self.spec_storage.get_spec(spec_id)
                snapshot["specs"][spec_id] = spec.dict()
        
        # Snapshot graph state
        snapshot["graph_state"] = await self.neo4j.export_subgraph(
            mutation.project_id
        )
        
        # Store snapshot
        await self._store_snapshot(snapshot)
        
        return snapshot
    
    async def _rollback(
        self,
        mutation: Mutation,
        snapshot: Dict[str, Any],
        result: ExecutionResult
    ):
        """Rollback mutation changes"""
        logger.info(f"Rolling back mutation {mutation.id}")
        
        try:
            # Restore specs from snapshot
            for spec_id, spec_data in snapshot["specs"].items():
                await self.spec_storage.restore_spec(spec_id, spec_data)
            
            # Restore graph state
            await self.neo4j.restore_subgraph(snapshot["graph_state"])
            
            result.status = ExecutionStatus.ROLLED_BACK
            result.rollback_available = False
        
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            result.errors.append({
                "error": "Rollback failed",
                "details": str(e)
            })
    
    async def _update_graph(self, mutation: Mutation):
        """Update Neo4j graph with mutation changes"""
        for change in mutation.changes:
            if change.operation_type == "create":
                await self.neo4j.create_node(change)
            elif change.operation_type == "modify":
                await self.neo4j.update_node(change)
            elif change.operation_type == "delete":
                await self.neo4j.delete_node(change)

# Task 7.2: Change Handlers
# Location: /lattice_mutation_engine/execution/change_handlers.py

class ChangeHandler(ABC):
    """Base class for change handlers"""
    
    @abstractmethod
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Execute the change"""
        pass
    
    @abstractmethod
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate change can be executed"""
        pass

class CreateChangeHandler(ChangeHandler):
    """Handle create operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Create new spec or file"""
        
        # Check if already exists
        exists = await storage.exists(change.file_path)
        if exists:
            raise ValueError(f"File already exists: {change.file_path}")
        
        # Create the file
        await storage.create_file(
            path=change.file_path,
            content=change.content,
            metadata=change.metadata
        )
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate create operation"""
        exists = await storage.exists(change.file_path)
        if exists:
            raise ValueError(f"Cannot create, file exists: {change.file_path}")

class ModifyChangeHandler(ChangeHandler):
    """Handle modify operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Modify existing spec or file"""
        
        # Check if exists
        exists = await storage.exists(change.file_path)
        if not exists:
            raise ValueError(f"File does not exist: {change.file_path}")
        
        # Get current content
        current = await storage.read_file(change.file_path)
        
        # Apply diff if provided
        if change.diff:
            new_content = self._apply_diff(current, change.diff)
        else:
            new_content = change.content
        
        # Update the file
        await storage.update_file(
            path=change.file_path,
            content=new_content,
            metadata=change.metadata
        )
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate modify operation"""
        exists = await storage.exists(change.file_path)
        if not exists:
            raise ValueError(f"Cannot modify, file not found: {change.file_path}")
    
    def _apply_diff(self, current: str, diff: str) -> str:
        """Apply unified diff to current content"""
        import difflib
        # Parse and apply diff
        lines = current.splitlines(keepends=True)
        diff_lines = diff.splitlines(keepends=True)
        
        # Apply patch
        patched = difflib.unified_diff([], lines, fromfile='', tofile='')
        return ''.join(patched)

class DeleteChangeHandler(ChangeHandler):
    """Handle delete operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Delete spec or file"""
        
        exists = await storage.exists(change.file_path)
        if not exists:
            logger.warning(f"File already deleted: {change.file_path}")
            return
        
        await storage.delete_file(change.file_path)
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate delete operation"""
        exists = await storage.exists(change.file_path)
        if not exists:
            raise ValueError(f"Cannot delete, file not found: {change.file_path}")

class RenameChangeHandler(ChangeHandler):
    """Handle rename/move operations"""
    
    async def execute(self, change: FileChange, storage: "SpecStorage"):
        """Rename or move file"""
        
        old_path = change.file_path
        new_path = change.metadata.get("new_path")
        
        if not new_path:
            raise ValueError("Rename operation requires 'new_path' in metadata")
        
        # Check source exists
        exists = await storage.exists(old_path)
        if not exists:
            raise ValueError(f"Source file not found: {old_path}")
        
        # Check destination doesn't exist
        dest_exists = await storage.exists(new_path)
        if dest_exists:
            raise ValueError(f"Destination already exists: {new_path}")
        
        await storage.move_file(old_path, new_path)
    
    async def validate(self, change: FileChange, storage: "SpecStorage"):
        """Validate rename operation"""
        old_path = change.file_path
        new_path = change.metadata.get("new_path")
        
        if not new_path:
            raise ValueError("Rename requires 'new_path' in metadata")
        
        exists = await storage.exists(old_path)
        if not exists:
            raise ValueError(f"Source not found: {old_path}")
        
        dest_exists = await storage.exists(new_path)
        if dest_exists:
            raise ValueError(f"Destination exists: {new_path}")
```

**Day 3-4: Conflict Detection & Resolution**
```python
# Task 7.3: Conflict Detection
# Location: /lattice_mutation_engine/execution/conflict_detector.py

class ConflictType(str, Enum):
    CONCURRENT_MODIFICATION = "concurrent_modification"
    DEPENDENCY_VIOLATION = "dependency_violation"
    SCHEMA_INCOMPATIBILITY = "schema_incompatibility"
    FILE_COLLISION = "file_collision"

class Conflict(BaseModel):
    type: ConflictType
    severity: str  # "error", "warning"
    description: str
    affected_files: List[str] = []
    conflicting_mutations: List[str] = []
    resolution_suggestions: List[str] = []

class ConflictDetector:
    """Detect conflicts between mutations"""
    
    async def detect_conflicts(
        self,
        mutation: Mutation,
        context: Dict[str, Any]
    ) -> List[Conflict]:
        """Detect all conflicts for a mutation"""
        
        conflicts = []
        
        # Check concurrent modifications
        concurrent_conflicts = await self._check_concurrent_modifications(mutation)
        conflicts.extend(concurrent_conflicts)
        
        # Check dependency violations
        dependency_conflicts = await self._check_dependencies(mutation)
        conflicts.extend(dependency_conflicts)
        
        # Check schema compatibility
        schema_conflicts = await self._check_schema_compatibility(mutation)
        conflicts.extend(schema_conflicts)
        
        # Check file collisions
        file_conflicts = await self._check_file_collisions(mutation)
        conflicts.extend(file_conflicts)
        
        return conflicts
    
    async def _check_concurrent_modifications(
        self,
        mutation: Mutation
    ) -> List[Conflict]:
        """Check for concurrent modifications to same files"""
        
        conflicts = []
        
        # Get pending mutations for same project
        async with db.get_session() as session:
            repo = MutationRepository(session)
            pending_mutations = await repo.get_pending(mutation.project_id)
        
        # Check for overlapping file changes
        mutation_files = set(c.file_path for c in mutation.changes)
        
        for pending in pending_mutations:
            if pending.id == mutation.id:
                continue
            
            pending_files = set(c.file_path for c in pending.changes)
            overlapping = mutation_files & pending_files
            
            if overlapping:
                conflicts.append(Conflict(
                    type=ConflictType.CONCURRENT_MODIFICATION,
                    severity="error",
                    description=f"Concurrent modification detected with mutation {pending.id}",
                    affected_files=list(overlapping),
                    conflicting_mutations=[pending.id],
                    resolution_suggestions=[
                        "Merge changes manually",
                        "Wait for other mutation to complete",
                        "Rebase your changes"
                    ]
                ))
        
        return conflicts
    
    async def _check_dependencies(
        self,
        mutation: Mutation
    ) -> List[Conflict]:
        """Check for dependency violations"""
        
        conflicts = []
        
        # Query Neo4j for dependencies
        dependencies = await self.neo4j.get_dependencies(mutation.project_id)
        
        # Check if mutation breaks any dependencies
        for change in mutation.changes:
            if change.operation_type == "delete":
                # Check if other specs depend on this
                dependents = [
                    d for d in dependencies 
                    if d["source"] == change.file_path
                ]
                
                if dependents:
                    conflicts.append(Conflict(
                        type=ConflictType.DEPENDENCY_VIOLATION,
                        severity="error",
                        description=f"Cannot delete {change.file_path}, other specs depend on it",
                        affected_files=[change.file_path],
                        resolution_suggestions=[
                            "Remove dependencies first",
                            "Update dependent specs",
                            "Change operation to modify instead of delete"
                        ]
                    ))
        
        return conflicts
    
    async def _check_schema_compatibility(
        self,
        mutation: Mutation
    ) -> List[Conflict]:
        """Check schema compatibility"""
        
        conflicts = []
        
        # Get project schema
        spec = await self.spec_storage.get_spec(mutation.spec_id)
        if not spec or not spec.schema_definition:
            return conflicts
        
        schema = json.loads(spec.schema_definition)
        
        # Validate each change against schema
        for change in mutation.changes:
            try:
                self._validate_against_schema(change, schema)
            except ValidationError as e:
                conflicts.append(Conflict(
                    type=ConflictType.SCHEMA_INCOMPATIBILITY,
                    severity="error",
                    description=f"Schema validation failed: {e}",
                    affected_files=[change.file_path],
                    resolution_suggestions=[
                        "Update schema definition",
                        "Modify change to match schema",
                        "Create schema migration"
                    ]
                ))
        
        return conflicts

# Task 7.4: Conflict Resolution Strategies
# Location: /lattice_mutation_engine/execution/conflict_resolver.py

class ResolutionStrategy(str, Enum):
    MANUAL = "manual"
    AUTO_MERGE = "auto_merge"
    REBASE = "rebase"
    ACCEPT_THEIRS = "accept_theirs"
    ACCEPT_OURS = "accept_ours"

class ConflictResolver:
    """Resolve conflicts between mutations"""
    
    async def resolve(
        self,
        mutation: Mutation,
        conflicts: List[Conflict],
        strategy: ResolutionStrategy
    ) -> Mutation:
        """Resolve conflicts and return updated mutation"""
        
        if strategy == ResolutionStrategy.MANUAL:
            # Mark for manual resolution
            mutation.status = "needs_manual_resolution"
            mutation.metadata["conflicts"] = [c.dict() for c in conflicts]
            return mutation
        
        elif strategy == ResolutionStrategy.AUTO_MERGE:
            return await self._auto_merge(mutation, conflicts)
        
        elif strategy == ResolutionStrategy.REBASE:
            return await self._rebase_mutation(mutation, conflicts)
        
        elif strategy == ResolutionStrategy.ACCEPT_THEIRS:
            return await self._accept_conflicting_changes(mutation, conflicts)
        
        elif strategy == ResolutionStrategy.ACCEPT_OURS:
            # Keep our changes, ignore conflicts
            return mutation
    
    async def _auto_merge(
        self,
        mutation: Mutation,
        conflicts: List[Conflict]
    ) -> Mutation:
        """Automatically merge non-conflicting changes"""
        
        # Get conflicting mutations
        conflicting_mutation_ids = set()
        for conflict in conflicts:
            conflicting_mutation_ids.update(conflict.conflicting_mutations)
        
        # Load conflicting mutations
        async with db.get_session() as session:
            repo = MutationRepository(session)
            conflicting_mutations = [
                await repo.get_by_id(mid)
                for mid in conflicting_mutation_ids
            ]
        
        # Perform three-way merge
        merged_changes = []
        for change in mutation.changes:
            # Find corresponding changes in conflicting mutations
            conflict_changes = []
            for conf_mut in conflicting_mutations:
                for conf_change in conf_mut.changes:
                    if conf_change.file_path == change.file_path:
                        conflict_changes.append(conf_change)
            
            if not conflict_changes:
                # No conflict, keep our change
                merged_changes.append(change)
            else:
                # Attempt automatic merge
                merged = await self._merge_changes(change, conflict_changes)
                merged_changes.append(merged)
        
        mutation.changes = merged_changes
        return mutation
    
    async def _merge_changes(
        self,
        our_change: FileChange,
        their_changes: List[FileChange]
    ) -> FileChange:
        """Merge multiple changes to same file"""
        
        # Use diff3 algorithm for three-way merge
        # This is simplified - real implementation would use proper merge tools
        
        base_content = await self.spec_storage.read_file(our_change.file_path)
        our_content = our_change.content
        
        for their_change in their_changes:
            their_content = their_change.content
            
            # Perform three-way merge
            merged_content = self._three_way_merge(
                base_content,
                our_content,
                their_content
            )
            
            # Update for next iteration
            our_content = merged_content
        
        # Create merged change
        merged_change = our_change.copy()
        merged_change.content = merged_content
        merged_change.metadata["merged"] = True
        merged_change.metadata["merged_from"] = [c.id for c in their_changes]
        
        return merged_change
    
    def _three_way_merge(
        self,
        base: str,
        ours: str,
        theirs: str
    ) -> str:
        """Three-way merge algorithm"""
        
        import difflib
        
        # Split into lines
        base_lines = base.splitlines(keepends=True)
        our_lines = ours.splitlines(keepends=True)
        their_lines = theirs.splitlines(keepends=True)
        
        # Create diffs
        our_diff = list(difflib.unified_diff(base_lines, our_lines))
        their_diff = list(difflib.unified_diff(base_lines, their_lines))
        
        # Merge diffs (simplified)
        merged_lines = base_lines.copy()
        
        # Apply non-overlapping changes
        # Real implementation would handle conflicts properly
        
        return ''.join(merged_lines)
```

**Day 5: Execution API & Testing**
```python
# Task 7.5: Execution API Endpoints
# Location: /lattice_mutation_engine/api/endpoints/execution.py

@router.post("/mutations/{mutation_id}/execute")
async def execute_mutation(
    mutation_id: str,
    dry_run: bool = False,
    user: User = Depends(PermissionChecker(Permission.MUTATION_DEPLOY)),
    executor: MutationExecutor = Depends()
):
    """Execute a mutation"""
    
    # Get mutation
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
        
        if mutation.status != "approved":
            raise HTTPException(400, "Mutation must be approved before execution")
    
    # Execute mutation
    result = await executor.execute_mutation(mutation, dry_run=dry_run)
    
    # Update mutation status
    if not dry_run:
        mutation.status = result.status
        mutation.metadata["execution_result"] = result.dict()
        await repo.update(mutation)
    
    return result

@router.post("/mutations/{mutation_id}/detect-conflicts")
async def detect_conflicts(
    mutation_id: str,
    user: User = Depends(get_current_user),
    detector: ConflictDetector = Depends()
):
    """Detect conflicts for a mutation"""
    
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
    
    conflicts = await detector.detect_conflicts(mutation, {})
    
    return {
        "mutation_id": mutation_id,
        "conflicts": conflicts,
        "has_conflicts": len(conflicts) > 0,
        "conflict_count": len(conflicts)
    }

@router.post("/mutations/{mutation_id}/resolve-conflicts")
async def resolve_conflicts(
    mutation_id: str,
    strategy: ResolutionStrategy,
    user: User = Depends(PermissionChecker(Permission.MUTATION_APPROVE)),
    resolver: ConflictResolver = Depends()
):
    """Resolve conflicts for a mutation"""
    
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
        
        # Detect conflicts
        detector = ConflictDetector()
        conflicts = await detector.detect_conflicts(mutation, {})
        
        if not conflicts:
            return {"message": "No conflicts to resolve"}
        
        # Resolve conflicts
        resolved_mutation = await resolver.resolve(mutation, conflicts, strategy)
        
        # Update mutation
        await repo.update(resolved_mutation)
    
    return {
        "mutation_id": mutation_id,
        "strategy": strategy,
        "resolved": True
    }

@router.post("/mutations/{mutation_id}/rollback")
async def rollback_mutation(
    mutation_id: str,
    user: User = Depends(PermissionChecker(Permission.MUTATION_DEPLOY)),
    executor: MutationExecutor = Depends()
):
    """Rollback a mutation"""
    
    async with db.get_session() as session:
        repo = MutationRepository(session)
        mutation = await repo.get_by_id(mutation_id)
        
        if not mutation:
            raise HTTPException(404, "Mutation not found")
        
        if mutation.status != "completed":
            raise HTTPException(400, "Can only rollback completed mutations")
        
        # Load snapshot
        snapshot = await load_snapshot(mutation_id)
        if not snapshot:
            raise HTTPException(404, "Snapshot not found for rollback")
        
        # Perform rollback
        result = ExecutionResult(mutation_id=mutation_id, status=ExecutionStatus.IN_PROGRESS)
        await executor._rollback(mutation, snapshot, result)
        
        # Update mutation
        mutation.status = "rolled_back"
        await repo.update(mutation)
    
    return {
        "mutation_id": mutation_id,
        "rolled_back": True,
        "status": "rolled_back"
    }

# Task 7.6: Execution Tests
# Location: /tests/test_execution.py

@pytest.mark.asyncio
async def test_execute_mutation_success():
    """Test successful mutation execution"""
    executor = create_test_executor()
    mutation = create_test_mutation()
    
    result = await executor.execute_mutation(mutation)
    
    assert result.status == ExecutionStatus.COMPLETED
    assert len(result.executed_changes) == len(mutation.changes)
    assert len(result.failed_changes) == 0

@pytest.mark.asyncio
async def test_conflict_detection():
    """Test conflict detection"""
    detector = ConflictDetector()
    mutation1 = create_test_mutation(file_path="api/users.py")
    mutation2 = create_test_mutation(file_path="api/users.py")
    
    # Store first mutation as pending
    await store_pending_mutation(mutation1)
    
    # Detect conflicts for
