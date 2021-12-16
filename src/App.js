import React, {useEffect, useState} from 'react';
import githubLogo from './assets/github-logo.png';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import { ethers } from 'ethers';
import myEpicGame from './utils/MyEpicGame.json';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

const GITHUB_HANDLE = 'lucasfras';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}`;


const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  useEffect(() => {
    setIsLoading(false);
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        console.log(txn.name);
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if(!ethereum) {
        console.log("No metamask detected!");
        setIsLoading(false);
        return;
      } else {
        

        console.log("There's a metamask detected!!", ethereum);

        const accounts = await ethereum.request({method: 'eth_accounts'});

        if(accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an account!!", account);
          setCurrentAccount(account);
        } else {
          console.log("No account found!!");
        }
      setIsLoading(false);

      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  const connectWalletAction = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        setIsLoading(false);
        alert('Get Metamask!');
        return;
      }


      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  }

  

  const renderContent = () => {

    if(isLoading){
      return <LoadingIndicator />;
    }
    
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://images.fineartamerica.com/images/artworkimages/mediumlarge/2/crook-character-mob-boss-flyland-designs.jpg"
            alt="BigBossBattle"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect your MetaMask wallet to get started!!
          </button>
        </div>
      )
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    }

  }


  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Lucas Battle ⚔️</p>
          <p className="sub-text-left">Account Connected: {currentAccount}</p>
          <p className="sub-text">Defeat the BigBoss</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="GitHub Logo" className="github-logo" src={githubLogo} />
          <a
            className="footer-text"
            href={GITHUB_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by: ${GITHUB_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
