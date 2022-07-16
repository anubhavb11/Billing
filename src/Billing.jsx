import './App.css';
import { useState, useEffect } from 'react';

export default function Billing({ items , handelInputChange, createNewItem ,deleteItem ,setlocal, createTotal ,clearItem}){
  
    return(
      <div>
        <table>
          <tr>
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
                <td><input type="text" value={item.name} onChange={(e) => handelInputChange(e,id,"name")}/></td>
                <td><input type="text" className="small" value={item.description} onChange={(e) => handelInputChange(e,id,"description")}/></td>
                <td><input type="number" className="small" value={item.qty} onChange={(e) => handelInputChange(e,id,"qty")}/></td> 
                <td><input type="number" className="small" value={item.rate} onChange={(e) => handelInputChange(e,id,"rate")}/></td>
                <td><input type="text" className="small" value={item.amount}/></td>
                <button onClick={() => deleteItem(id)} >Delete</button>
                {/* <input>{item.name}</input>
                <input>{item.rate}</input>
                <input>{item.qty*item.rate}</input> */}
              </tr>
          ))}
          <div>
            Total {createTotal()}
          </div>
            <button onClick={() => createNewItem()}>+</button>
            {/* <button onClick={() => createTotal()}>Total</button> */}
            <button onClick={() => setlocal()}>Save</button>
            <button onClick= {() => clearItem()}>Clear</button>
        </table>
      </div>
    )
  }
  