import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userEmail = session.customer_email;

    await prisma.user.update({
      where: { email: userEmail },
      data: { isPremium: true },
    });
  }

  return NextResponse.json({ received: true });
}
