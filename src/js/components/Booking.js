import {templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';



class Booking {
  constructor(bookingContainer){
    const thisBooking = this;

    thisBooking.starters = [];
    thisBooking.tableSelected = null;
    thisBooking.phone = null;
    thisBooking.address = null;


    thisBooking.render(bookingContainer);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.resetTables();
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: parseInt(thisBooking.tableSelected),
      duration: parseInt(thisBooking.hoursAmountWidget.correctValue),
      ppl: parseInt(thisBooking.peopleAmountWidget.correctValue),
      starters: thisBooking.starters,
      phone: thisBooking.phone,
      address: thisBooking.address,
    };

    console.log('url: ', url);
    console.log('payload: ', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
      });
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
        //console.log('bookings', bookings);
        //console.log('eventsCurrent', eventsCurrent);
        //console.log('eventsRepeat', eventsRepeat);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });


  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);

    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    //bookingContainer.innerHTML = generatedHTML;

    //v2
    //thisBooking.dom = utils.createDOMFromHTML(generatedHTML);
    //bookingContainer.append(thisBooking.dom);

    //v3 albo dokładnie z zapisem poleceń
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmountElem = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmountElem = document.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePickerElem = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerElem = document.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = document.querySelectorAll(select.booking.tables);

    thisBooking.dom.floorPlan = document.querySelector(select.booking.floorPlan);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);

    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);


  }

  resetTables(){
    const thisBooking = this;

    for(let table = 0; table<=2; table++){
      thisBooking.dom.tables[table].classList.remove('selected');
    }
  }

  initTables(event){
    const thisBooking = this;

    if(event.target.classList.contains('table')){
      if(event.target.classList.contains('booked')){
        console.log('stolik zajęty');
      } else {
        if(!event.target.classList.contains('selected')){
          thisBooking.resetTables();
          event.target.classList.toggle('selected');
          thisBooking.tableSelected = parseInt(event.target.dataset.table);
        } else {
          event.target.classList.toggle('selected');
          thisBooking.tableSelected = null;
        }
      }
    }


  }

  updateStarters(event){
    const thisBooking = this;
    const starter = thisBooking.starters;

    if (event.target.checked && starter.indexOf(event.target.value)<0){
      starter.push(event.target.value);
    } else {
      starter.splice(starter.indexOf(event.target.value), 1);
    }
  }

  initWidgets(){
    const thisBooking = this;
    //const starter = starterstab;

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
      thisBooking.resetTables();
    });

    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPickerElem);
    thisBooking.dom.hourPickerElem.addEventListener('updated', function(event){
      event.preventDefault();
      thisBooking.resetTables();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.initTables(event);
    });


    for(let check of thisBooking.dom.starters){
      check.addEventListener('click', function(event){
        thisBooking.updateStarters(event);
      });
    }

    thisBooking.dom.submit.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.address.addEventListener('change', function(event) {
      event.preventDefault();
      thisBooking.address = event.target.value;
    });

    thisBooking.dom.phone.addEventListener('change', function(event) {
      event.preventDefault();
      thisBooking.phone = event.target.value;
    });
  }
}

export default Booking;
