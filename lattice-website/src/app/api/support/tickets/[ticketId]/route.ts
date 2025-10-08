import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateTicketStatusSchema } from '@/lib/validations/ticket';

interface Params {
  params: Promise<{ ticketId: string }>;
}

/**
 * GET /api/support/tickets/[ticketId]
 * Retrieve a single ticket by ID or ticket number
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;

    // Find ticket by ID or ticket number
    const ticket = await db.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        attachments: true,
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/support/tickets/[ticketId]
 * Update a ticket (status, priority, assignment)
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateTicketStatusSchema.parse(body);

    // Find the ticket first
    const existingTicket = await db.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId }
        ]
      }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData
    };

    // Handle timestamp updates based on status changes
    if (validatedData.status === 'resolved' && existingTicket.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }

    if (validatedData.status === 'closed' && existingTicket.status !== 'closed') {
      updateData.closedAt = new Date();
    }

    // Update the ticket
    const updatedTicket = await db.supportTicket.update({
      where: { id: existingTicket.id },
      data: updateData,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    return NextResponse.json({
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Error updating ticket:', error);

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/support/tickets/[ticketId]
 * Delete a ticket (admin only, soft delete recommended)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { ticketId } = await params;

    // Find the ticket first
    const existingTicket = await db.supportTicket.findFirst({
      where: {
        OR: [
          { id: ticketId },
          { ticketNumber: ticketId }
        ]
      }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Delete related messages and attachments first (cascade)
    await db.$transaction(async (tx) => {
      // Delete messages
      await tx.ticketMessage.deleteMany({
        where: { ticketId: existingTicket.id }
      });

      // Delete attachments
      await db.ticketAttachment.deleteMany({
        where: { ticketId: existingTicket.id }
      });

      // Delete the ticket
      await tx.supportTicket.delete({
        where: { id: existingTicket.id }
      });
    });

    return NextResponse.json(
      { message: 'Ticket deleted successfully' },
      { status: 204 }
    );

  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}