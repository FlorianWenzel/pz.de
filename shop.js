const muetzePrice = 200;
const plueschPrice = 200;
const shirtPrice = 299;
const expShirtPrice = 349;

module.exports = {
  buy: function(users, nodemailer, log, socket, account, u, p, product, street, plz, city, print, misc, vorname, name, zusatz, contactPerMail, contactPerTwitch, email) {
    if (!u || !p || !product || !street || !plz || !city || !print || !vorname || !name) {
      return;
    }
    user = users.findOne({
      name: u,
      password: p
    });
    if (!user) {
      return;
    }
    switch (product) {
      case 'PlüschZwiebel':
        if (user.taler < plueschPrice) {
          return;
        } else {
          change = -plueschPrice;
          user.taler -= plueschPrice;
        }
        break;
      case 'ZwiebelMütze':
        if (user.taler < muetzePrice) {
          return;
        } else {
          change = -muetzePrice;
          user.taler -= muetzePrice;
        }
        break;
      case 'ZwiebelShirt':
        if (user.taler < shirtPrice) {
          return;
        } else {
          change = -shirtPrice;
          user.taler -= shirtPrice;
        }
        break;
      case '!ZwiebelShirt':
        if (user.taler < expShirtPrice) {
          return;
        } else {
          change = -expShirtPrice;
          user.taler -= expShirtPrice;
        }
        break;
    }
    nodemailer.createTestAccount((err, acc) => {

      let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'pokerzwiebel@gmail.com',
          pass: account.password
        }
      });
      let mailOptions = {
        from: '<PokerZwiebel@gmail.com>',
        to: 'PokerZwiebel@gmail.com',
        subject: 'Bestellung ' + product + ' von ' + u,
        text: '<b>Neue Bestellung:</b> <br>' +
          'Benutzername: ' + u + ' <br>' +
          'Vorname: ' + vorname + ' Nachname: ' + name + '<br>' +
          'Product: ' + product + '<br>' +
          'Straße: ' + street + ' <br>' +
          'Zusatz: ' + zusatz + ' <br>' +
          'PLZ: ' + plz + ' <br>' +
          'Stadt: ' + city + ' <br>' +
          'Aufdruck: ' + print + '<br>' +
          'Kontakt Per Mail: ' + contactPerMail + 'Email: ' + email + '<br>' +
          'Kontakt Per Twitch' + contactPerTwitch +
          'Sonstiges: ' + misc + '<br>--------------',
        html: '<b>Neue Bestellung:</b> <br>' +
          'Benutzername: ' + u + ' <br>' +
          'Vorname: ' + vorname + ' Nachname: ' + name + '<br>' +
          'Product: ' + product + '<br>' +
          'Straße: ' + street + ' <br>' +
          'Zusatz: ' + zusatz + ' <br>' +
          'PLZ: ' + plz + ' <br>' +
          'Stadt: ' + city + ' <br>' +
          'Aufdruck: ' + print + '<br>' +
          'Kontakt Per Mail: ' + contactPerMail + ' Email: ' + email + '<br>' +
          'Kontakt Per Twitch: ' + contactPerTwitch + '<br>' +
          'Sonstiges: ' + misc + '<br>--------------'
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
      });
    });
    log.addLog(logs, user.name, user.name, 'ZwiebelTaler', change, 'Bestellung (' + product + ')')
    socket.emit('updateTaler', user.taler);
    socket.emit('updateCoins', user.coins);
    socket.emit('confirmPurchase', product);
  }
}
