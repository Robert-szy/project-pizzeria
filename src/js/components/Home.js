//import utils from '../utils.js';
import {templates, select} from '../settings.js';
//import Flickity from '../../vendor/flickity.pkgd.js';
//import Flickity from 'flickity';


class Home {
  constructor(app, element){
    const thisHome = this;

    thisHome.getElements();
    thisHome.render(element);
    thisHome.initWidgets(app);

    console.log('newHome', thisHome);
  }

  getElements(){
    //const thisHome = this;



    //thisHome.dom.phone = thisHome.dom.wrapper.querySelector(select.cart.phone);

  }

  render(element){
    const thisHome = this;

    const generatedHTML = templates.homePage();

    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carouselElem = document.querySelector(select.widgets.carousel.wrapper);
    thisHome.dom.orderElem = document.querySelector(select.home.order);
    thisHome.dom.bookingElem = document.querySelector(select.home.booking);
  }

  initWidgets(app){
    const thisHome = this;
    const thisApp = app;
    // eslint-disable-next-line no-undef
    const flkty = new Flickity ( thisHome.dom.carouselElem, {
      // options
      groupCells: 2,
      adaptiveHeight: true,
      autoPlay: 3000,
      cellAlign: 'left',
      wrapAround: true,
      contain: true,
      selectedAttraction: 0.005,
      friction: 0.15,
      prevNextButtons: false
    });

    //flkty.next();
    flkty.select( 3 );

    thisHome.dom.orderElem.addEventListener('click', function(event){
      const clickedElement = this;
      event.preventDefault();
      const id = clickedElement.getAttribute('id').replace('block-', '');
      thisApp.activatePage(id);
    });

    thisHome.dom.bookingElem.addEventListener('click', function(event){
      const clickedElement = this;
      event.preventDefault();
      const id = clickedElement.getAttribute('id').replace('block-', '');
      thisApp.activatePage(id);
    });
  }
}


export default Home;
