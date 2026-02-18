import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { verified: false, error: 'Transaction ID required' },
        { status: 400 }
      );
    }

    // Verify with Flutterwave API
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (
      data.status === 'success' &&
      data.data.status === 'successful'
    ) {
      return NextResponse.json({
        verified: true,
        data: {
          amount: data.data.amount,
          currency: data.data.currency,
          customer: data.data.customer,
          tx_ref: data.data.tx_ref,
          flw_ref: data.data.flw_ref,
        },
      });
    }

    return NextResponse.json({
      verified: false,
      error: 'Payment not successful',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { verified: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}