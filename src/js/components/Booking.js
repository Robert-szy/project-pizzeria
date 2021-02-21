import {templates, select, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';



class Booking {
  constructor(bookingContainer){
    const thisBooking = this;

    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then (function(allResponses){
        const bookingResponse = allResponses[0];
        const evenstCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingResponse.json(),
          evenstCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        console.log('bookings', bookings);
        console.log('eventsCurrent', eventsCurrent);
        console.log('eventsRepeat', eventsRepeat);
      });


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

    thisBooking.dom.datePickerElem = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerElem = document.querySelector(select.widgets.hourPicker.wrapper);

  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmountElem);
    thisBooking.dom.peopleAmountElem.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmountElem);
    thisBooking.dom.hoursAmountElem.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePickerElem);
    thisBooking.dom.datePickerElem.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPickerElem);
    thisBooking.dom.hourPickerElem.addEventListener('updated', function(event){
      event.preventDefault();
    });

  }
}

export default Booking;
