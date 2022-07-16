import React from 'react';
import './Invoice.css'
import { useScreenshot } from 'use-react-screenshot'
import { createRef } from 'react';
import {database} from '../../firebase'
import {ref,push,child,update} from "firebase/database";
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from 'reactstrap';
const Invoice = ({items, createTotal }) => {
  const refss = createRef(null)
  const [image, takeScreenshot] = useScreenshot()
  const [cusName, setCusName] = useState("");
  const [cusAddress, setCusAddress] = useState("");
  const getImage = () => takeScreenshot(refss.current);
  const handleSubmit = () =>{
    console.log(items)
    let obj = {
           items:  [...items],
           name: cusName,
           cusAddress: cusAddress,
           dateAndTime: new Date()

    } 
        console.log("UPDATE")      
    const newPostKey = push(child(ref(database),'dewd')).key;
    console.log(newPostKey)
    const updates = {};
    updates['/Invoice' + newPostKey] = obj;
    console.log(updates)
    toast.success("Saved !");
    return update(ref(database), updates);
  }
  const handelCustomerChange = (name) =>{
      setCusName(name);
  }
  const handelCustomerAddressChange = (add) => {
    setCusAddress(add);
  }
    return (
        <div>
          <input type="text" onChange={(e) => handelCustomerChange(e.target.value)}/>
          <input type="text" onChange={(e) => handelCustomerAddressChange(e.target.value)}/>
          <Button color="success" onClick={() => handleSubmit()}>Save</Button>
          <ToastContainer
          position="bottom-center"
          autoClose={500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
           />
          <div ref={refss} className="invoice">
            <h2 className='store-name'>Bansal Store</h2>
            <p> A-135 Madhu Vihar Lane no - 8</p>
            <p>Contact no - 7678642241</p>
            <table id="demo" class="editable">
            <tr className='table-heading'>
              <th >Sno</th>
              <th>Name of the item</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          
            {items && items.map((item,id)=>(
                <tr>
                  {console.log(item)}
                  <td className="ex-small">{id +1}</td>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.qty}</td> 
                  <td>{item.rate}</td>
                  <td>{item.amount}</td>
                </tr>
            ))}
          </table>
          <div className="total">
              <div>
              Total &nbsp;
              </div>
              <div>
              {createTotal()}
              </div>       
          </div>
        </div>
       
        <div>
          <button style={{ marginBottom: '10px' }} onClick={getImage}>
            Take screenshot
          </button>
        </div>
        <img  className='smlImg' src={image} alt={'Screenshot'} />
      </div>

    );
}

export default Invoice;
