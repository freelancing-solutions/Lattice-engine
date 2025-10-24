import { Server } from 'socket.io';

// Ticket-related interfaces
interface TicketData {
  id: string;
  ticketNumber: string;
  status: string;
  priority: string;
  subject: string;
  userEmail: string;
  userName?: string;
  category: string;
}

interface MessageData {
  id: string;
  ticketId: string;
  ticketNumber: string;
  content: string;
  isStaffReply: boolean;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

// Helper functions for real-time ticket events
export const emitTicketCreated = (io: Server, ticket: TicketData) => {
  // Broadcast to admin dashboard
  io.to('admin:tickets').emit('ticket:created', {
    ticket,
    timestamp: new Date().toISOString()
  });

  console.log(`Ticket ${ticket.ticketNumber} created - broadcasted to admins`);
};

export const emitTicketUpdated = (io: Server, ticketId: string, updates: Partial<TicketData>) => {
  // Broadcast to specific ticket room
  io.to(`ticket:${ticketId}`).emit('ticket:updated', {
    ticketId,
    updates,
    timestamp: new Date().toISOString()
  });

  // Also broadcast to admin dashboard
  io.to('admin:tickets').emit('ticket:updated', {
    ticketId,
    updates,
    timestamp: new Date().toISOString()
  });

  console.log(`Ticket ${ticketId} updated - broadcasted to viewers and admins`);
};

export const emitTicketMessage = (io: Server, message: MessageData) => {
  // Broadcast to specific ticket room
  io.to(`ticket:${message.ticketId}`).emit('ticket:message', {
    message,
    timestamp: new Date().toISOString()
  });

  // Also broadcast to admin dashboard for real-time updates
  io.to('admin:tickets').emit('ticket:message', {
    message,
    timestamp: new Date().toISOString()
  });

  console.log(`New message for ticket ${message.ticketNumber} - broadcasted to viewers`);
};

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Legacy message handling (keeping existing functionality)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Ticket-related event handlers

    // Join ticket room for real-time updates
    socket.on('ticket:join', (ticketId: string) => {
      socket.join(`ticket:${ticketId}`);
      console.log(`Client ${socket.id} joined ticket room: ${ticketId}`);
    });

    // Leave ticket room
    socket.on('ticket:leave', (ticketId: string) => {
      socket.leave(`ticket:${ticketId}`);
      console.log(`Client ${socket.id} left ticket room: ${ticketId}`);
    });

    // Join admin dashboard room for receiving all ticket updates
    socket.on('admin:join', () => {
      socket.join('admin:tickets');
      console.log(`Client ${socket.id} joined admin dashboard`);
    });

    // Leave admin dashboard room
    socket.on('admin:leave', () => {
      socket.leave('admin:tickets');
      console.log(`Client ${socket.id} left admin dashboard`);
    });

    // Handle ticket status updates from admin dashboard
    socket.on('ticket:status-update', (data: { ticketId: string; status: string; priority?: string }) => {
      // This would typically be handled by API routes, but we can support socket-based updates too
      emitTicketUpdated(io, data.ticketId, {
        status: data.status,
        ...(data.priority && { priority: data.priority })
      });
    });

    // Handle typing indicators (for future enhancement)
    socket.on('ticket:typing', (data: { ticketId: string; isTyping: boolean; userName: string }) => {
      socket.to(`ticket:${data.ticketId}`).emit('ticket:typing', {
        ticketId: data.ticketId,
        isTyping: data.isTyping,
        userName: data.userName,
        socketId: socket.id
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Clean up any room memberships if needed
      // Socket.IO handles this automatically when a client disconnects
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Lattice Support Real-time System!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};