'use server';

interface ShippingPayload {
  orderId: string;
  name: string;
  phone: string;
  pinCode: string;
  address: string;
  amount: number;
  isCOD: boolean;
}

export async function createDelhiveryShipment(data: ShippingPayload) {
  const token = process.env.DELHIVERY_API_TOKEN;
  
  if (!token) {
    console.error("Missing Delhivery API Token");
    return { success: false, error: "Configuration missing" };
  }

  // Format exact request structure mapped out by Delhivery API requirements
  const body = {
    shipments: [
      {
        client: "VARAM_ORGANICS",
        order: data.orderId,
        name: data.name,
        phone: data.phone,
        pin: data.pinCode,
        add: data.address,
        payment_mode: data.isCOD ? "COD" : "Prepaid",
        cod_amount: data.isCOD ? data.amount : 0,
        total_amount: data.amount,
        quantity: 1
      }
    ],
    pickup_location: {
      name: "PRIMARY_WAREHOUSE"
    }
  };

  try {
    const response = await fetch("https://track.delhivery.com/api/cmu/create.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Delhivery API failed: ${response.statusText}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating Delhivery shipment:", error);
    return { success: false, error: "Failed to connect to logistics provider" };
  }
}
