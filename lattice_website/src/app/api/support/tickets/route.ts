import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createTicketSchema, ticketQuerySchema } from '@/lib/validations/ticket';
import { generateTicketNumber } from '@/lib/ticket-utils';

/**
 * GET /api/support/tickets
 * List/search tickets with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query = {
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    // Validate query parameters
    const validatedQuery = ticketQuerySchema.parse(query);

    // Build where clause
    const where: any = {};

    if (validatedQuery.status) {
      where.status = validatedQuery.status;
    }

    if (validatedQuery.category) {
      where.category = validatedQuery.category;
    }

    if (validatedQuery.priority) {
      where.priority = validatedQuery.priority;
    }

    if (validatedQuery.search) {
      where.OR = [
        { ticketNumber: { contains: validatedQuery.search, mode: 'insensitive' } },
        { subject: { contains: validatedQuery.search, mode: 'insensitive' } },
        { userEmail: { contains: validatedQuery.search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (validatedQuery.page - 1) * validatedQuery.limit;

    // Get total count for pagination
    const total = await db.supportTicket.count({ where });

    // Fetch tickets with pagination
    const tickets = await db.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: validatedQuery.limit,
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / validatedQuery.limit);

    return NextResponse.json({
      tickets,
      pagination: {
        total,
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        totalPages,
        hasNext: validatedQuery.page < totalPages,
        hasPrev: validatedQuery.page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support/tickets
 * Create a new support ticket
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createTicketSchema.parse(body);

    // Generate unique ticket number
    const ticketNumber = generateTicketNumber();

    // Check if ticket number already exists (very unlikely but possible)
    let finalTicketNumber = ticketNumber;
    let existingTicket = await db.supportTicket.findUnique({
      where: { ticketNumber: finalTicketNumber }
    });

    // Generate new ticket number if collision occurs
    while (existingTicket) {
      finalTicketNumber = generateTicketNumber();
      existingTicket = await db.supportTicket.findUnique({
        where: { ticketNumber: finalTicketNumber }
      });
    }

    // Create ticket and initial message in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the support ticket
      const ticket = await tx.supportTicket.create({
        data: {
          ticketNumber: finalTicketNumber,
          category: validatedData.category,
          priority: validatedData.priority,
          status: 'open',
          subject: validatedData.subject,
          description: validatedData.description,
          userEmail: validatedData.userEmail,
          userName: validatedData.userName || null
        }
      });

      // Create initial message from the description
      const initialMessage = await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          content: validatedData.description,
          isStaffReply: false,
          authorName: validatedData.userName || 'Anonymous',
          authorEmail: validatedData.userEmail
        }
      });

      return { ticket, initialMessage };
    });

    return NextResponse.json({
      message: 'Ticket created successfully',
      ticket: result.ticket,
      ticketNumber: result.ticket.ticketNumber
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating ticket:', error);

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}