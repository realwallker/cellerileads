import { NextRequest, NextResponse } from 'next/server';
import { dispatchMetaCapiEvent } from '@/lib/meta/capi';
import { notifyStageChange } from '@/lib/telegram/notify';
import { Lead, PipelineStageId } from '@/lib/types';
import { INITIAL_VENDORS } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lead, stageId, testEventCode, customValue } = body as {
      lead: Lead;
      stageId: PipelineStageId;
      testEventCode?: string;
      customValue?: number;
    };

    if (!lead || !stageId) {
      return NextResponse.json(
        { success: false, error: 'Missing lead or stageId in request body' },
        { status: 400 }
      );
    }

    // 1. Dispatch CAPI Event to Meta
    const capiResult = await dispatchMetaCapiEvent({
      lead,
      stageId,
      testEventCode,
      customValue,
    });

    // 2. Resolve vendor name
    const vendor = INITIAL_VENDORS.find((v) => v.id === lead.assignedTo);

    // 3. Send Telegram notification
    await notifyStageChange(lead, stageId, vendor?.fullName);

    return NextResponse.json({
      success: capiResult.success,
      eventsReceived: capiResult.eventsReceived,
      fbtraceId: capiResult.fbtraceId,
      log: capiResult.log,
      errorMessage: capiResult.errorMessage,
    });
  } catch (err: unknown) {
    console.error('[API CAPI Trigger Error]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
