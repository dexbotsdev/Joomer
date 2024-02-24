/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useRouter } from "next/router";
import { ReactNode, useCallback, useState } from "react";
import { getSearchLayout } from "../components/layouts/SearchLayout";
import { useSerumMarkets } from "../hooks/useSerumMarkets";
import { classNames } from "../utils/general";
import { prettifyDecimal } from "../utils/numerical";
import { Button, Card,Table, TableProps } from 'antd';
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair } from "@solana/web3.js";

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

  const generateWallets = useCallback((count:number) => {
    const newWallets :any = []; 
    for (let i = 0; i < count; i++) {
      const keypair = Keypair.generate();
      newWallets.push({
        publicKey: keypair.publicKey.toBase58(),
        privateKey: keypair.secretKey,
        balance:0
      });
    } 
    setAccounts(newWallets); 
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
  const { serumMarkets, loading: serumMarketsLoading } = useSerumMarkets();
  const StatBlock = ({
    children,
    loading,
    height,
  }: {
    children: React.ReactNode;
    loading: boolean;
    height?: number;
  }) => {
    return !loading || network ? (
      <div
        className={classNames(
          "bg-slate-800 py-2 px-3 rounded-md space-y-1 border border-slate-700"
        )}
      >
        {children}
      </div>
    ) : (
      <div
        className={classNames(
          "animate-pulse bg-slate-800 py-2 px-3 rounded-md space-y-1 border border-slate-700",
          height ? `h-${height}` : "h-20"
        )}
      />
    );
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <StatBlock loading={serumMarketsLoading}>
          <div>
            <p className="text-transparent bg-clip-text serum-gradient text-sm">
              # of markets
            </p>
          </div>
          {serumMarkets ? (
            <div>
              <p className="text-2xl font-medium text-slate-200">
                {prettifyDecimal(serumMarkets!.length, 2)}
              </p>
            </div>
          ) : null}
          {serumMarketsLoading ? (
            <div className="bg-slate-700 animate-pulse w-full h-8 rounded-lg" />
          ) : null}
        </StatBlock>
        {connected && 
             <Card title="Wallets" size="small"  style={{width:'100%'}}  extra={ 
              <>
              <Button  onClick={() => setShowAccountsModal(true)}>Generate</Button> &nbsp; &nbsp; &nbsp;
              <Button>Random Deposit</Button> &nbsp; &nbsp; &nbsp;
              <Button>Reset</Button> &nbsp; &nbsp; &nbsp;
              </>
             }> 

             {accounts && accounts.length>0 ? 
             <> 
             <Table
              {...tableProps}
              pagination={{ position: [bottom] }}
              columns={columns}
              dataSource={accounts}
             />
             </>:
             <>
             </>}
            </Card> }
      </div>
    </div>
  );
};

Home.getLayout = (page: ReactNode) => getSearchLayout(page, "Home");

export default Home;
