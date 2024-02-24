/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useRouter } from "next/router";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { getSearchLayout } from "../components/layouts/SearchLayout";
import { useSerumMarkets } from "../hooks/useSerumMarkets";
import { classNames } from "../utils/general";
import { prettifyDecimal } from "../utils/numerical";
import { Button, Card,  TableProps } from 'antd';
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";
import { getHeaderLayout } from "../components/layouts/HeaderLayout";
import CloggerCountsModal from "../components/CloggerCountsModal";
import { Table } from "ant-table-extensions";
import base58 from "bs58";
import { Http2ServerResponse } from "http2";
const Home = () => {
  const router = useRouter();
  const { network } = router.query;
  const { connected ,wallet,publicKey} = useWallet() 
  const [showAccountsModal, setShowAccountsModal] = useState(false)

  const [accounts,setAccounts]=useState([]);
  const defaultTitle = () => '';
  const defaultFooter = () => '';
  const [bottom, setBottom] = useState<TablePaginationPosition>('bottomRight');


  const handleCloseAccounts = useCallback(() => {
    setShowAccountsModal(false)
  }, [])

  const deposit = async () => {
    const newWallets :any = []; 
     
    const response :any = await fetch('/api/depositSol', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ masterWalletAddress:publicKey }),
    })

    if(response.status == 200){
      setAccounts(response.wallets); 
    }
  }

  const generateWallets = useCallback(async (count:any) => {
    const newWallets :any = []; 
     
    const response = await fetch('/api/generateWallets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletCount:count, masterKey:publicKey }),
    }).then((res=>res.json()))
    setAccounts(response.wallets); 
   }, [accounts])

  const columns = [
    {
      title: 'Address',
      dataIndex: 'publicKey',
      key: 'publicKey',
    }, 
    {
      title: 'Balance (SOL)',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: 'Action',
      dataIndex: '',
      key: 'x',
      render: () => <Button>Sell</Button>,
    },
  ];
  type TablePaginationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';
  interface DataType {
    key: number;
    name: string;
    age: number;
    address: string;
    description: string;
  }
  const tableProps: TableProps<DataType> = {
    bordered:true,
    loading:false,
    size:'small',
    expandable:undefined,
    title: defaultTitle,
    showHeader:true,
    footer: defaultFooter, 
    tableLayout:'fixed',
  };
  const fetchWallets = async () => {
    try {
      const response :any= await fetch(`/api/generateWallets?masterWalletAddress=${publicKey}`);
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.wallets); 
      } else {
        console.error('Failed to fetch wallets:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };


   useEffect(() => { 
    if (publicKey && connected) {
       fetchWallets();
    }
  }, [connected]);


  return (
    <div className="flex flex-col"   style={{width:'80%'}}  >
      <div className="grid grid-cols-1 md:grid-cols-1 gap-2 items-stretch"> 
        {connected && 
             <Card title="Wallets" size="small"  style={{width:'100%'}}  extra={ 
              <>
              <Button  onClick={() => setShowAccountsModal(true)}>Generate</Button> &nbsp; &nbsp; &nbsp;
              <Button onClick={()=>deposit()}>Random Deposit</Button> &nbsp; &nbsp; &nbsp;
               </>
             }> 

             {accounts && accounts.length>0 ? 
             <> 
             <Table
              {...tableProps}
              pagination={{ position: [bottom] }}
              columns={columns}
              dataSource={accounts}
              exportable={true}
             />
             </>:
             <>
             </>}
            </Card> }
      </div>
      {showAccountsModal ? (
        <CloggerCountsModal
          onClose={handleCloseAccounts}
          isOpen={showAccountsModal}
          generate={generateWallets}
        />
      ) : null}
    </div>
  );
};

Home.getLayout = (page: ReactNode) => getHeaderLayout(page, "Home");

export default Home;
