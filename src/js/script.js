/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { utils } = require("stylelint");

//const { utils } = require("stylelint");

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      // wersja pierwotna totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',

      //wersja zmieniona - z rozbiciem na dwa selecty
      totalPrice: '.cart__total-price strong',
      totalOrderPrice: '.cart__order-total .cart__order-price-sum strong',
      //koniec wersji zmienionej

      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu ();
      thisProduct.getElements ();
      thisProduct.initAccordion ();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){
      const thisProduct = this;
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log('generatedHTML: ', generatedHTML);

      /*create element using utils.createEmentsFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);

      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //const clickableTrigger = document.querySelector(select.menuProduct.clickable);

      ////console.log('clikableTrigger: ', clickableTrigger);

      /* START: add event listener to clickable trigger on event click */
      //clicableTrigger.addEventListener('click', function(event) {
      thisProduct.accordionTrigger.addEventListener('click', function(event) {

        /*pojedyncze klikniecie na dany produkt (tylko pierwszy) powoduje czterokrotny przebieg po tej funkcji*/
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log('activeProduct: ', activeProduct);
        //console.log('thisProduct.element: ', thisProduct.element);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct!=thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('thisProduct: ', thisProduct);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.addToCart();
        thisProduct.processOrder();
      });
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log(paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          //const option = param.options[optionId];
          //console.log('oid: ', optionId, 'oo: ', option);

          const optionImage = thisProduct.imageWrapper.querySelector('.'+paramId+'-'+optionId);
          //console.log(optionImage);

          //czy dana opcja (optionId) danej kategorii (paramId) jest wybrana w formularzu (formData)
          if (formData[paramId] && formData[paramId].includes(optionId)){

            if(optionImage){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }

            /*jeśli jest zaznaczona opcja, która nie jest domyślna, cena produktu musi się
            zwiększyć o cenę tej opcji*/
            if(!param.options[optionId].hasOwnProperty('default')){
              price += param.options[optionId].price;
            }

          /*jeśli nie jest zaznaczona opcja, która jest domyślna, cena produktu musi się
          zmniejszyć o cenę tej opcji*/
          } else {

            if(optionImage){
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }

            if(param.options[optionId].hasOwnProperty('default')){
              price -= param.options[optionId].price;
            }
          }
        }
      }

      // add priceSingle property
      thisProduct.priceSingle = price;
      // multiply price by amount
      price*=thisProduct.amountWidget.value;
      // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle*thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams(),
      };
      thisProduct.prepareCartProductParams();
      return productSummary;
    }

    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProductParams(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {

      };
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //czy dana opcja (optionId) danej kategorii (paramId) jest wybrana w formularzu (formData)
          if (optionSelected){
            params[paramId].options[optionId] = option.label;

          }
        }
      }
      console.log('thisProduct params', params);
      return params;
    }


  }

  // eslint-disable-next-line no-unused-vars
  class AmountWidget {
    constructor(element){
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      thisWidget.announce();

      console.log('AmountWidget: ', thisWidget);
      console.log('constructor argument', element);
    }

    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      /*Validation*/
      if (newValue!==thisWidget.value && !isNaN(newValue) && newValue>= settings.amountWidget.defaultMin && newValue<=settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

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
      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for(let product=0; product<thisCart.products.length; product++){
        totalNumber += thisCart.products[product].amount;
        subtotalPrice += thisCart.products[product].price;
      }

      if (totalNumber){
        thisCart.totalPrice = subtotalPrice + deliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
        thisCart.dom.totalPrice.innerHTML = subtotalPrice + deliveryFee;

        //dodane po rozbiciu selektora
        thisCart.dom.totalOrderPrice.innerHTML = subtotalPrice + deliveryFee;
        //koniec zmiany
      }

      console.log('deliveryFee: ', deliveryFee, 'totalNumber: ', totalNumber, 'subtotalPrice: ', subtotalPrice, 'totalPrice: ', thisCart.totalPrice);
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
  }

  class CartProduct {
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;


      thisCartProduct.getElements(element);
      console.log('newCartProduct', thisCartProduct);

      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.amount = thisCartProduct.dom.wrapper.querySelector(select.widgets.amount.input);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function(event){
        event.preventDefault();
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;

        thisCartProduct.dom.amount.innerHTML = thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log('remove');

    }

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();

      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();

      });

    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      for(let productData in thisApp.data.products){
        new Product (productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

  };

  app.init();
}
