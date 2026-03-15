async function test() {
  try {
    const res = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": "Bearer APP_USR-7075806748498268-031411-204edce982a1d1491d8d421060898405-741242383",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        preapproval_plan_id: "51c5da418ce24a9bb2cd4fcf9b8b05cb",
        payer_email: "caleblunaxd123+admin@gmail.com",
        back_url: "https://chambape.pe/profesional/creditos?status=success",
        reason: "Suscripción Básico",
        external_reference: "USER_ID_12345"
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

test();
