const generateAnEmail = (emailObj) => {

    const { delivery, coupon, total, address, buyerName, phone, } = emailObj;

    const tr = (food) => `<tr>  <td style="width: 40%;">${food.name}</td>
    <td style="width: 40%;">${food.availableAt}</td>
    <td style="width: 10%;">${food.price}</td>
    <td style="width: 10%;">${food.quantity || 1}</td></tr>`

    const data = emailObj.foods.map((food) => (
        tr(food)
    ))

    const elements = data.join('\n');

    const html = `<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> <style> img { margin: auto; } body { font-family: Arial, sans-serif; margin: 0; padding: 0; } table { width: 100%; border-collapse: collapse; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); } th, td { border: 2px solid #DE7230; padding: 1px; text-align: left; text-align: inherit; } /* Add responsive styles for smaller screens */ @media (max-width: 768px) { .table-container { overflow-x: auto; } table { max-width: 100%; } th, td { padding: 8px; font-size: 14px; } } table, td { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0; mso-table-rspace: 0; } img { -ms-interpolation-mode: bicubic; } a { text-decoration: underline; } .container { border: 3px #DE7230 solid; border-top-right-radius: 10px; border-top-left-radius: 10px; } .footerDiv { border: 3px #DE7230 solid; border-top-width: 15px; border: 3px #DE7230 solid; border-bottom-right-radius: 10px; border-bottom-left-radius: 10px; } .text-center { text-align: center; } .text-start { text-align: start; font-size: inherit; } .text-end { text-align: end; font-size: inherit; } .flex { display: flex; align-items: center; justify-content: center; } .text-primary { color: #00FFFF } .text-secondary { color: #DE7230; } .text-gold { color: #FFCF40 !important; } .logoContainer { display: grid; place-items: center } .im { color: #00FFFF !important; } .im { color: #00FFFF; } </style> </head> <body class="im im" style="max-width: 600px; margin: 0; padding: 0; border-radius: 10px; mso-line-height-rule: exactly;"> <center style="width: 100%; background-color: #040D21; border-radius: 10px;"> <div style="width: 100%; margin: 0 auto;"> <div class="im container"> <div class="im logoContainer" style="margin:auto;"> <img width="70px" src="https://owldaccabd.com/assets/imgs/logo.png" alt=""> </div> <span class="im text-primary">Thank you for ordering from Owl Dacca.</span> </div> </tr> </table> <div class="im text-primary"> <table> <thead class="im text-center"> <tr class="im text-center"> <th style="width: 30%;">Name</th> <th style="width: 30%;">Restaurant</th> <th style="width: 10%;">Price</th> <th style="width: 10%;">Qnt</th> </tr> </thead> <tbody id="trContainerFoods" class="im text-center"> ${elements} </tbody> </table> </div> <div class="im text-primary footerDiv "> <table> <tr class="im "> <th style="width: 35%;"> Delivery fee </th> <th id="Delivery" class="im text-end" style="width: 65%;">${delivery}</th> </tr> <tr class="im "> <th style="width: 35%;">Discount coupon </th> <th id="Coupon" class="im text-end" style="width: 65%;">${coupon}</th> </tr> <tr class="im "> <th style="width: 35%;"> Total </th> <th id="Total" class="text-end text-gold" style="width: 65%;">${total}</th> </tr> </table> <hr> <span style="display: block;"> <table class="im "> <tr class="im "> <th style="width: 25%;">Details</th> <th id="address" class="im text-end" style="width: 75%;">${address} , ${buyerName}, ${phone} </th> </tr> </table> </span> <p>Continue to shopping at <a class="im text-secondary" href="https://owldaccabd.com/"> owldaccabd.com </a> </p> </div> </div> </center> </body> </html>
`

    return html;
}

module.exports = generateAnEmail;