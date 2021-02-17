import {templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';



class Booking {
  constructor(bookingContainer){
    const thisBooking = this;

    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;

    //v1 i v2
    //const bookingContainer = element;

    const generatedHTML = templates.bookingWidget();

    //v3
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    //jak lepiej? czy dodać wygenerowany html czy utworzony DOM? czy to czym się potem różni? inaczej działa
    //v1
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    //v2
    //thisBooking.dom = utils.createDOMFromHTML(generatedHTML);
    //bookingContainer.append(thisBooking.dom);

    //v3 albo dokładnie z zapisem poleceń
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmountElem = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmountElem = document.querySelector(select.booking.hoursAmount);

  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmountElem);
    thisBooking.dom.peopleAmountElem.addEventListener('updated', function(event){
      event.preventDefault();
      //thisBooking.amount = thisBooking.amountWidget.value;
      //thisBooking.price = thisBooking.amount * thisBooking.priceSingle;

      //thisBooking.dom.amount.innerHTML = thisBooking.amount;
      //thisBooking.dom.price.innerHTML = thisBooking.price;

    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmountElem);
    thisBooking.dom.hoursAmountElem.addEventListener('updated', function(event){
      event.preventDefault();
      //thisBooking.amount = thisBooking.amountWidget.value;
      //thisBooking.price = thisBooking.amount * thisBooking.priceSingle;

      //thisBooking.dom.amount.innerHTML = thisBooking.amount;
      //thisBooking.dom.price.innerHTML = thisBooking.price;

    });

  }
}

export default Booking;
