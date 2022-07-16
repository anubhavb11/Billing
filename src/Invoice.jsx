import React from 'react';
import './App.css'
const Invoice = ({items, createTotal }) => {
    return (
        <div>
        <table id="demo" class="editable">
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
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.qty}</td> 
                <td>{item.rate}</td>
                <td>{item.amount}</td>
                {/* <input>{item.name}</input>
                <input>{item.rate}</input>
                <input>{item.qty*item.rate}</input> */}
              </tr>
          ))}
          <div>
            Total {createTotal()}
          </div>
            {/* <button onClick={() => createNewItem()}>+</button>
            <button onClick={() => setlocal()}>Save</button>
            <button onClick= {() => clearItem()}>Clear</button> */}
        </table>
      </div>
    );
}

export default Invoice;
