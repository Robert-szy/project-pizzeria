import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    console.log('newCart', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);

    //dodane po rozbiciu selektora
    thisCart.dom.totalOrderPrice = thisCart.dom.wrapper.querySelector(select.cart.totalOrderPrice);
    //koniec zmiany

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

    thisCart.dom.address.addEventListener('change', function(event) {
      event.preventDefault();
      thisCart.sendOrder;
    });

    thisCart.dom.phone.addEventListener('change', function(event) {
      event.preventDefault();
      thisCart.sendOrder;
    });
  }

  add(menuProduct){
    const thisCart = this;
    /*generate HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);

    /*create element using utils.createEmentsFromHTML*/
    thisCart.generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /*add element to menu*/
    thisCart.dom.productList.appendChild(thisCart.generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, thisCart.generatedDOM));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    let totalNumber = 0;
    let subtotalPrice = 0;

    /*for(let product=0; product<thisCart.products.length; product++){
      totalNumber += thisCart.products[product].amount;
      subtotalPrice += thisCart.products[product].price;
    }*/

    for(let product of thisCart.products){
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }

    //if (totalNumber){
    thisCart.totalNumber = totalNumber;
    thisCart.subTotalPrice = subtotalPrice;
    thisCart.totalPrice = subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = subtotalPrice + thisCart.deliveryFee;

    //dodane po rozbiciu selektora
    thisCart.dom.totalOrderPrice.innerHTML = subtotalPrice + thisCart.deliveryFee;
    //koniec zmiany
    //}

    console.log('deliveryFee: ', thisCart.deliveryFee, 'totalNumber: ', totalNumber, 'subtotalPrice: ', subtotalPrice, 'totalPrice: ', thisCart.totalPrice);
    //thisProduct.priceElem.innerHTML = price;

  }

  remove(cartProduct){
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    if(index>=0){
      thisCart.products.splice(index,1);
      thisCart.dom.productList.children[index].remove();

      thisCart.update();
    }

  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    console.log('url: ', url);
    console.log('payload: ', payload);

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

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
      });
  }
}

export default Cart;
