import React, { useState, useEffect } from "react";
import "../styles.css";
import Base from "./Base";
import Card from "./Card";
import { loadCart } from "./helper/cartHelper";

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setProducts(loadCart());
  }, [reload]);

  const loadAllProdcuts = (products) => {
    return (
      <div>
        <h2>This section is to load Products</h2>

        {products.map((product, index) => {
          return (
            <Card
              key={index}
              product={product}
              removeFromCart={true}
              addtoCart={false}
              setReload={setReload}
              reload={reload}
            />
          );
        })}
      </div>
    );
  };

  const loadCheckout = () => {
    return (
      <div>
        <h2>This section is to load checkout</h2>
      </div>
    );
  };
  return (
    <Base title="Cart Page" description="Ready to checkout">
      <div className="row">
        <div className="col-6">
          {products.length > 0 ? (
            loadAllProdcuts(products)
          ) : (
            <h3> No Products in cart</h3>
          )}
        </div>
        <div className="col-6">{loadCheckout()}</div>
      </div>
    </Base>
  );
};

export default Cart;
