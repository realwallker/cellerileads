import { NextRequest, NextResponse } from 'next/server';
import { dispatchMetaCapiEvent } from '@/lib/meta/capi';
import { Lead } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const testCode = body.testEventCode || 'TEST12345';
    const eventName = body.eventName || 'Lead';

    const mockLead: Lead = {
      id: 'test_lead_' + Date.now(),
      metaLeadId: 335286051821999,
      source: 'meta',
      fullName: 'Prospecto de Prueba Célleri',
      email: 'test.lead@celleri-residences.ec',
      phone: '+593999999999',
      city: 'Guayaquil',
      stage: 'new_lead',
      lotInterest: 'Lote Test Célleri 1,000 m²',
      dealValue: 150000,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const stageId =
      eventName === 'Purchase'
        ? 'won'
        : eventName === 'Schedule'
        ? 'visit'
        : eventName === 'QualifiedLead'
        ? 'qualified'
        : 'new_lead';

    const result = await dispatchMetaCapiEvent({
      lead: mockLead,
      stageId,
      testEventCode: testCode,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
