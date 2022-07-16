import './App.css';
import './Billing.css'
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
          </table>
          <div className="total">
            <div>
             Total &nbsp;
            </div>
            <div>
            {createTotal()}
            </div>       
          </div>
          <div className="add-item">
            <button className='btn-sec' onClick={() => createNewItem()}>+</button>
          </div>
          <div className="save-clear">
            <button className='btn' onClick={() => setlocal()}>Save</button> &nbsp; &nbsp;
            <button className='btn' onClick= {() => clearItem()}>Clear</button>
          </div>
           
        
      </div>
    )
  }
  