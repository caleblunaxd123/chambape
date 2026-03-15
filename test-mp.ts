import { MercadoPagoConfig, PreApproval, Preference } from "mercadopago";

async function test() {
  const client = new MercadoPagoConfig({ accessToken: "APP_USR-7075806748498268-031411-204edce982a1d1491d8d421060898405-741242383" });

  try {
    const preApproval = new PreApproval(client);
    const res = await preApproval.create({
        body: {
          preapproval_plan_id: "51c5da418ce24a9bb2cd4fcf9b8b05cb",
          payer_email: "caleblunaxd123+admin@gmail.com",
          back_url: `http://localhost:3000/profesional/creditos?status=success_sub`,
          external_reference: `test_subs_1_${Date.now()}`,
          reason: `Suscripción Mensual - Básico - ChambaPe`,
        },
    });
    console.log("Success:", res.init_point);
  } catch (err: any) {
    console.error("Error creating subscription:", err.message, err.cause, err.response?.data);
  }
}

test();
