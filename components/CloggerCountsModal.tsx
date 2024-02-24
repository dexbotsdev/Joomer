import React, { FunctionComponent, useState } from 'react'
 import { Button, InputNumber, Modal } from 'antd';

export const LAST_ACCOUNT_KEY = 'lastCloggerViewed-3.0'

interface CloggerCountsModalProps {
  onClose: () => void
  isOpen: boolean
  generate: (count:number | null) => void

}

const CloggerCountsModal: FunctionComponent<CloggerCountsModalProps> = ({
  isOpen,
  onClose,
  generate
}) => {
  
  const [newCount, setNewcount] = useState<number|null>(4) 

  
  return (
    <Modal open={isOpen} closable={true} onCancel={onClose} onOk={onClose} >
 
          <> 
            <div className="pb-3 text-th-fgd-1">
              <div className="font-semibold pb-5 ">
                Enter the Number of Wallets you want to Generate
              </div>
              <InputNumber   style={{ width: '100%' }} defaultValue={4} value={newCount} onChange={(value)=>setNewcount(value)}/> 
            </div>
            <Button onClick={()=>generate(newCount)}>Generate</Button> &nbsp; &nbsp; &nbsp;
          </>
        
    </Modal>
  )
}
 

export default React.memo(CloggerCountsModal)
