//import utils from '../utils.js';
import {templates, select} from '../settings.js';
//import Flickity from '../../vendor/flickity.pkgd.js';
//import Flickity from 'flickity';


class Home {
  constructor(element){
    const thisHome = this;

    thisHome.getElements();
    thisHome.render(element);
    thisHome.initWidgets();

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
  }

  initWidgets(){
    const thisHome = this;
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
  }
}


export default Home;
