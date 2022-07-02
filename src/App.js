import './App.css';
import { useState } from 'react';



function Billing(){

  const [items,setItems] = useState([
    {
  },
]);

  const handelInputChange = (e,id,type) =>{
    console.log(id);
    const cpyItems = [...items];
    console.log(cpyItems[id][type]);
    cpyItems[id][type] = e.target.value;
    setItems(cpyItems)
  }
  const createNewItem = () =>{
    const cpyItems = [...items];
    cpyItems.push({});
    setItems(cpyItems)
  }
  return(
    <div>
      <table>
        <tr>
          <th>Qty</th>
          <th>Name</th>
          <th>Rate</th>
          <th>Total</th>
        </tr>
       
        {items.map((item,id)=>(
             <tr>
              <td><input type="number" value={item.qty} onChange={(e) => handelInputChange(e,id,"qty")}/></td> 
              <td><input type="text" value={item.name} onChange={(e) => handelInputChange(e,id,"name")}/></td>
              <td><input type="number" value={item.rate} onChange={(e) => handelInputChange(e,id,"rate")}/></td>
              <td><input type="text" value={isNaN(item.qty*item.rate)? "" : item.qty*item.rate}/></td>
              {/* <input>{item.name}</input>
              <input>{item.rate}</input>
              <input>{item.qty*item.rate}</input> */}
            </tr>
        ))}
          <button onClick={() => createNewItem()}>+</button>
          
       
      </table>
    </div>
  )
}


function App() {

  return (
    <div className="App">
      <Billing/>
    </div>
  );
}

export default App;
