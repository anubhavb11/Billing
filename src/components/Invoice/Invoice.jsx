import React from 'react';
import './Invoice.css'
import { useScreenshot } from 'use-react-screenshot'
import { createRef } from 'react';
const Invoice = ({items, createTotal }) => {
  const ref = createRef(null)
  const [image, takeScreenshot] = useScreenshot()
  const getImage = () => takeScreenshot(ref.current)
    return (
        <div>
          <div ref={ref} className="invoice">
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
        <img  src={image} alt={'Screenshot'} />
      </div>

    );
}

export default Invoice;
