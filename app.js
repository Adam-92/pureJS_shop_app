const client = contentful.createClient({
  //Space ID
  space: "ibhhsmmy5bh9",
  //Token
  accessToken: "EzBApSKxE24_yIPlyBS0iSHZoUug-dlqA3IH0DKzWjc"
});

//-----Variables-----
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.cart-footer-btn');

const cartOverlay = document.querySelector('.cart-overlay'); 
const cartDOM = document.querySelector('.cart');
const cartContent = document.querySelector('.cart-content');
const cartItem = document.querySelector('.cart-item');
const cartTotal = document.querySelector('.cart-total');
const productsDOM = document.querySelector('.products-center');
const cartAmount = document.querySelector('.cart-items');

//cart
let cart = [];
//buttons
let buttonsDOM = [];
//-----getting the products--------
class Products {

    async getProducts(){
        try{
            console.log(client);
            let contenful = await client.getEntries();
            console.log(contenful);
                let products = contenful.items;
                    products = products.map(item => {
                        const {title,price} = item.fields;
                        const {id} = item.sys;
                        const image = item.fields.image.fields.file.url;
                        return {title,price,id,image};
                });
                return products;
        }catch(error){
            console.log(error);
        }   
    }
}
//-------UI--------
class UI {

    displayProducts(products){
        let result = '';
        //extract the products
        console.log(products);
        products.forEach(products => {

            const id = products.id;
            const price = products.price;
            const title = products.title;
            const img = products.image;

            result += `
            <!--single product-->
            <article class="product">
                <div class="img-container">
                    <img src="${img}" alt="${title}"
                    class="product-img">
                    <button class="bag-btn" data-id="${id}">
                        add to bag
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
                <h3>${title}</h3>
                <h4>${price}</h4>
            </article>
        <!--end of single product-->`;
        
        })    
      productsDOM.innerHTML = result;
  }

  getBagButtons(){
      //Take all .bag-btn 
      const buttons = [...document.querySelectorAll('.bag-btn')];
      buttonsDOM = buttons;
      buttons.forEach( button => {
          let id = button.dataset.id;
          let inCart = cart.find( item => item.id === id);
        //Change the text and disable the button
          if(inCart){
            button.innerText = 'In Cart';
            button.disabled = true;
          }
        
        button.addEventListener('click', () => {
                button.innerText = 'In Cart';
                button.disabled = true; 
            
                let product = {...Storage.getFromLocalStorage(id),
                amount:1};
                //Add product to the cart
                cart.push(product);
                //Save cart in local storage
                Storage.saveCart(cart);
                //Set cart values
                this.setCartValues(cart);
                //Display cart items inside the cart
                this.addCartProduct(product);
                //Show the cart
                this.showCart();
            })
      })    
  }

  setCartValues(cart){
    //Sum total price of all products  
    let priceTotal = 0;
    //Total items in cart
    let productsAmount = 0;
    cart.map(item => {
        priceTotal += item.price * item.amount;
        productsAmount += item.amount;
    })
    //Round the total price
    cartTotal.innerHTML = parseFloat(priceTotal.toFixed(2));
    //Items in cart
    cartAmount.innerText = productsAmount;
}

 //Add product in DOM
  addCartProduct(product){
    const div = document.createElement('div');
    div.classList.add('cart-item');

    div.innerHTML = `
        <img src="${product.image}" alt="">
        <div>
            <h4>${product.title}</h4>
            <h5>$${product.price}</h5>
            <span class="remove-item" data-id="${product.id}">remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id="${product.id}"></i>
                <p class="item-amount">${product.amount}</p>
            <i class="fas fa-chevron-down" data-id="${product.id}"></i>
        </div>`;

    cartContent.appendChild(div);
 } 
//Show card of the cart
 showCart(){
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
 }

//Hide card of the cart
 hideCart(){
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
}

//Start the configuration
 setupAPP(){
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.disaplyAllCartItems(cart);

    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
 }

//Display all cart items in the beginning from local Storage
 disaplyAllCartItems(cart){
     cart.forEach(item => {
         this.addCartProduct(item);
     })
}
//Functionality of the item put in the cart DOM
 cartLogic(){
    //Clear cart button
    clearCartBtn.addEventListener('click', ()=>{
        this.clearCart();
        this.delateDOM();
    })

    //Increase amount of item in Cart
    cartContent.addEventListener('click', event=>{
        if(event.target.classList.contains('remove-item'))
        {   
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            //Positioning of DOM
            cartContent.removeChild
            (removeItem.parentElement.parentElement)
            this.removeItem(id);
        }
        else if(event.target.classList.contains('fa-chevron-up'))
        {   
            let increaseAmount = event.target;
            let id = increaseAmount.dataset.id;
            this.increaseQuantity(id, increaseAmount);
            this.setCartValues(cart);
            Storage.saveCart(cart);
        }
        else if(event.target.classList.contains('fa-chevron-down'))
        {   
            let decreaseAmount = event.target;
            let id = decreaseAmount.dataset.id;
            this.decreaseQuantity(id, decreaseAmount);
        }
    })
 } 
//Decrease qunatity 
 decreaseQuantity(id, itemDOM){
     
    let item = cart.find(item => item.id === id);
    if(item.amount > 1)
    {
        item.amount--;
        itemDOM.previousElementSibling.innerHTML = item.amount;  
        this.setCartValues(cart);
        Storage.saveCart(cart);
    }else
    {
        cartContent.removeChild(itemDOM.parentElement.parentElement);
        this.removeItem(id);
    }
 }
 //Increase qunatity in cart and DOM quantity
 increaseQuantity(id, itemDOM){
     let item = cart.find(item=> item.id === id);
     item.amount++;
     itemDOM.nextElementSibling.innerHTML = item.amount;
 }
//Remove all items from cart in DOM
 clearCart(){
     let cartItems = cart.map( item => item.id);
     cartItems.forEach(id => this.removeItem(id));
 }
//Remove item
 removeItem(id){
    cart = cart.filter(item => item.id !== id);
    console.log(cart);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    //get deleted button
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = 'add to cart<i class="fas fa-shopping-cart"></i>';
 }
 //Get the correct button.bag-btn by id
 getSingleButton(id){
     console.log(buttonsDOM);
     return buttonsDOM.find(button => button.dataset.id === id);
 }
//Remove cartContent
 delateDOM(){
     cartContent.innerHTML = '';
}
}
//-------local storage-------
class Storage {
    //Save the product in local storage
    static saveProducts(product){   
        localStorage.setItem('products', JSON.stringify(product));
    }
    //Save the cart in local storage
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    //Get the product by id from local storage
    static getFromLocalStorage(id){
        let storage = localStorage.getItem('products');
        let products = JSON.parse(storage);
        let product = products.find( item => item.id === id);
        return product;
    }
    //Return the cart from local Storage
    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse
        (localStorage.getItem('cart')) : [];
    }
}

//Load APP
document.addEventListener('DOMContentLoaded', () => {
    const product = new Products();
    const ui = new UI();
    
    ui.setupAPP();

    product.getProducts()
    .then(resolve => {
        ui.displayProducts(resolve);  
        Storage.saveProducts(resolve); 
    })
    .then( () => {
        ui.getBagButtons();
        ui.cartLogic();
    })
});

