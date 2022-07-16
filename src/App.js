import './App.css';
import { useState, useEffect } from 'react';
import Billing from './components/Billing/Billing';
import Invoice from './components/Invoice/Invoice';
function App() {
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

const [view,setView] = useState('Bill')

  useEffect(()=>{
    const x = JSON.parse(localStorage.getItem('userOrder'));
    if(x){
    setItems(x);
    }
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
    cpyItems.splice(id,1);
    setItems(cpyItems)
  }

  const createTotal = () =>{
    const cpyItems = [...items];
    let ans =0;
    cpyItems.forEach((item,id)=>{
      if(!isNaN(item.amount)&& item.amount!=null && item.amount !== '' && !isNaN(ans)){
        console.log(ans)
        ans = ans + parseInt(item.amount);
       
      }
      console.log(ans)
    });
    return ans
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

  const changeView = () =>{
    if(view === 'Bill'){
    setView('Invoice')
    }
    else{
      setView('Bill')
    }
  }

  return (
    <div className="App">
      {view === 'Bill' &&  <Billing  items = {items} handelInputChange={handelInputChange} createNewItem={createNewItem} deleteItem={deleteItem} setlocal={setlocal} createTotal={createTotal} clearItem={clearItem}/>}
      <button className='btn' onClick={() => changeView()} >View</button>
      {view === 'Invoice' && <Invoice items = {items} createTotal={createTotal}  />}
    </div>
  );
}

export default App;
