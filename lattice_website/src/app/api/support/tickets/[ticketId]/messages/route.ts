import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { addTicketMessageSchema } from '@/lib/validations/ticket';

interface Params {
  params: Promise<{ ticketId: string }>;
}

/**
 * GET /api/support/tickets/[ticketId]/messages
 * List all messages for a specific ticket
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;

    // Verify ticket exists
    const ticket = await db.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId }
        ]
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Fetch all messages for the ticket
    const messages = await db.ticketMessage.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/support/tickets/[ticketId]/messages
 * Add a new message to a ticket
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = addTicketMessageSchema.parse(body);

    // Find the ticket first
    const ticket = await db.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId }
        ]
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check if ticket is closed (cannot add messages to closed tickets)
    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot add messages to closed tickets' },
        { status: 400 }
      );
    }

    // Create the message and update ticket timestamp
    const result = await db.$transaction(async (tx) => {
      // Create the new message
      const message = await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          content: validatedData.content,
          isStaffReply: validatedData.isStaffReply,
          authorName: validatedData.authorName,
          authorEmail: validatedData.authorEmail
        }
      });

      // Update ticket's updatedAt timestamp
      const updatedTicket = await tx.supportTicket.update({
        where: { id: ticket.id },
        data: { updatedAt: new Date() }
      });

      // If this is a staff reply and ticket was waiting for response, change status to in_progress
      if (validatedData.isStaffReply && ticket.status === 'waiting_response') {
        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: { status: 'in_progress' }
        });
      }

      // If this is a user reply and ticket was in_progress, change status to waiting_response
      if (!validatedData.isStaffReply && ticket.status === 'in_progress') {
        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: { status: 'waiting_response' }
        });
      }

      return { message, updatedTicket };
    });

    return NextResponse.json({
      message: 'Message added successfully',
      ticketMessage: result.message,
      ticket: result.updatedTicket
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding message:', error);

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add message' },
      { status: 500 }
    );
  }
}