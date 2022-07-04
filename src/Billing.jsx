import './App.css';
import { useState, useEffect } from 'react';

export default function Billing(){

    const [items,setItems] = useState([
      {
        "name": "",
        "description": '',
        "qty": "",
        "rate": "",
        "amount": "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      }
  ]);
  
    useEffect(()=>{
      console.log("Mounted")
      console.log(items)
      const x = JSON.parse(localStorage.getItem('userOrder'));
      setItems(x);
      console.log(x)
    },[])
  
    const handelInputChange = (e,id,type) =>{
      const cpyItems = [...items];
      cpyItems[id][type] = e.target.value;
      let item = cpyItems[id];
      if(type === 'rate' || type === 'qty'){
        isNaN(item.qty*item.rate)? item["amount"] = 0  : item["amount"] = item.qty*item.rate;
      }
      setItems(cpyItems)
    }
    const createNewItem = () =>{
      const cpyItems = [...items];
      cpyItems.push({
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      });
      setItems(cpyItems)
    }
  
    const deleteItem = (id) =>{
      const cpyItems = [...items];
      console.log(items);
      cpyItems.splice(id,1);
      console.log(cpyItems)
      setItems(cpyItems)
    }
  
    const createTotal = () =>{
      const cpyItems = [...items];
      let ans =0;
      // console.log(cpyItems)
      cpyItems.forEach((item,id)=>{
        if(!isNaN(item.amount)&& item.amount!=null && item.amount !== '' && !isNaN(ans)){
          console.log(ans)
          ans = ans + parseInt(item.amount);
         
        }
        console.log(ans)
      });
      // console.log(ans)
      // cpyItems.push({total: ans});
      // console.log(cpyItems);
      return <span>{ans}</span>
      // setItems(cpyItems);
  
    }
  
    const setlocal = () =>{
      localStorage.setItem('userOrder', JSON.stringify(items))
    }
    const clearItem = () =>{
      localStorage.setItem('userOrder', JSON.stringify([
        {
          "name": "",
          "description": '',
          "qty": "",
          "rate": "",
          "amount": "",
        },{
          name: "",
          description: '',
          qty: "",
          rate: "",
          amount: "",
        },{
          name: "",
          description: '',
          qty: "",
          rate: "",
          amount: "",
        },{
          name: "",
          description: '',
          qty: "",
          rate: "",
          amount: "",
        },{
          name: "",
          description: '',
          qty: "",
          rate: "",
          amount: "",
        }
    ]))
    }
  
  
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
            Total = {createTotal()}
          </div>
            <button onClick={() => createNewItem()}>+</button>
            {/* <button onClick={() => createTotal()}>Total</button> */}
            <button onClick={() => setlocal()}>Save</button>
            <button onClick= {() => clearItem()}>Clear</button>
        </table>
      </div>
    )
  }
  