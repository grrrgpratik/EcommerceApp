import DropIn from "braintree-web-drop-in-react";
import React, { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import { isAuthenticated } from "../auth/helper";
import Base from "./Base";
import { cartEmpty, loadCart, loadCartNo } from "./helper/cartHelper";
import { createOrder } from "./helper/orderHelper";
import { getmeToken, processPayment } from "./helper/paymentbhelper";
const Payment = () => {
  const [info, setInfo] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: "",
    instance: {},
  });
  const [products, setProducts] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setProducts(loadCart());
    getRedirect(products.length === 0);
  }, [reload]);

  const userId = isAuthenticated() && isAuthenticated().user._id;
  const token = isAuthenticated() && isAuthenticated().token;

  const getToken = (userId, token) => {
    getmeToken(userId, token).then((info) => {
      console.log("INFORMATION", info);
      if (info.error) {
        setInfo({
          ...info,
          error: info.error,
        });
      } else {
        const clientToken = info.clientToken;
        setInfo({ clientToken });
      }
    });
  };

  useEffect(() => {
    getToken(userId, token);
  }, [userId, token]);

  const onPurchase = () => {
    setInfo({ loading: true });
    let nonce;
    info.instance
      .requestPaymentMethod()
      .then((data) => {
        nonce = data.nonce;
        const paymentData = {
          paymentMethodNonce: nonce,
          amount: getAmount(),
        };
        processPayment(userId, token, paymentData)
          .then((response) => {
            setInfo({ ...info, success: response.success });
            console.log("Payment Success");

            const orderData = {
              products: products,
              transaction_id: response.transaction.id,
              amount: response.transaction.amount,
            };
            createOrder(userId, token, orderData);
            //Empty cart
            cartEmpty(() => {
              console.log("did we got the crash? ");
              getRedirect(true);
            });
            //force reload
            setReload(!reload);
          })
          .catch((err) => {
            setInfo({ loading: false, success: false });
            console.log(err);
          });
      })
      .catch((err) => {
        setInfo({ loading: false, success: false });
        console.log(err);
      });
  };

  const getAmount = () => {
    let amount = 0;
    products.map((p) => (amount += p.price * p.count));
    return amount;
  };

  const showbtDropIn = () => {
    return (
      <div>
        {info.clientToken !== null && products.length > 0 ? (
          <div>
            <DropIn
              options={{ authorization: info.clientToken }}
              onInstance={(instance) => (info.instance = instance)}
            />
            <button
              className="btn btn-block btn-success"
              onClick={() => {
                onPurchase();
              }}
            >
              Buy
            </button>
          </div>
        ) : (
          <h3>Loading...</h3>
        )}
      </div>
    );
  };

  const getRedirect = (redirect) => {
    if (redirect) {
      return <Redirect to="/" />;
    }
  };

  return (
    <Base
      title="Cart Page"
      description="Ready to checkout"
      className="container"
    >
      {loadCartNo() === 0 && <Redirect to="/" />}
      <div>
        <h3> You bill is {getAmount()}</h3>
        {showbtDropIn()}
      </div>
    </Base>
  );
};

export default Payment;
