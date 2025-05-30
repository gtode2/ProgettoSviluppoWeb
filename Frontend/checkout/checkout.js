document.addEventListener("DOMContentLoaded", async()=>{

})
async function checkout() {
  const stripe = Stripe("pk_test_51RS1sSCVBLOChcNpv66SvPBqQHL2ywIF6b2U7JV55lojCqexs9UclwyWCgDSwLgyZnEPP8m6fHymSbfuNIiQP5VS00nymP7hWO");
  try {
    const response = await fetch("/confirmCheckout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },    
    })
    const data = await response.json()
    
    if (!response.ok) {

    }else{
      console.log(data.id);
      
      const result = await stripe.redirectToCheckout({sessionId:data.id})
      if (result.error) {
          alert("Errore nel reindirizzamento: " + result.error.message);
      }
    }
  } catch (err) {
      console.log(err);
      alert("Errore di rete.");
  }
}