import React, { useState } from "react";
import styled from "styled-components";
import PrimaryButton from "../components/PrimaryButton";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { delegateToSafe } from "../services/rhinestoneHandler";
import Loader from "../components/Loader";

const LandingContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(180deg, #003366 0%, #66b3ff 100%);
  position: relative;
  overflow: hidden;
  font-family: "Nunito", sans-serif;
  display: flex;
  flex-direction: column;

  &::before {
    content: "";
    position: fixed;
    bottom: -75px;
    left: 0;
    width: 100%;
    height: 70%;
    background-image: url("/lines.svg");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: bottom;
    opacity: 0.5;
    pointer-events: none;
    z-index: -0;
    mix-blend-mode: overlay;
  }

  &::after {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/noise.png");
    background-repeat: repeat;
    background-size: 150px 150px;
    opacity: 0.1;
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: overlay;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1rem;
  min-height: 100vh;
  width: 100%;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 40px;

  img {
    width: 140px;
    height: 140px;
  }

  span {
    color: #ffd700;
    font-size: 2rem;
    font-weight: bold;
  }
`;

const MainContent = styled.div`
  text-align: center;
  color: white;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  line-height: 1.2;

  .highlight {
    color: #ffd700;
    text-shadow: 0px 3px 0px rgba(0, 0, 0, 1), 1px 1px 0 black;
  }
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  margin-bottom: 32px;
  opacity: 0.9;
`;

const LisaCharacter = styled.div`
  position: fixed;
  bottom: 80px;
  left: 8%;
  width: 180px;
  height: 280px;
  background-image: url("/lisa.svg");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom;
  z-index: 2;
`;

const SpeechBubble = styled.div`
  position: fixed;
  left: calc(8% + 160px);
  bottom: 220px;
  background: white;
  padding: 15px;
  border-radius: 20px;
  max-width: 200px;
  z-index: 2;

  &::after {
    content: "";
    position: absolute;
    left: -20px;
    bottom: 20px;
    border: 10px solid transparent;
    border-right-color: white;
  }

  p {
    color: black;
    font-size: 1rem;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 0;
  display: flex;
  justify-content: center;

  button {
    background: #ffd700;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.1rem;
    cursor: pointer;

    &:hover {
      background: #f7c948;
    }
  }

  .bitcoin-symbol {
    margin-right: 8px;
    opacity: 0.3;
  }
`;

const BottomBackground = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 0;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const Landing: React.FC = () => {
  const { login, ready, authenticated } = usePrivy();
  const [showLoader, setShowLoader] = useState(false);
  const { wallets } = useWallets();

  const handleConnect = async () => {
    login();
  };

  return (
    <LandingContainer>
      <ContentWrapper>
        <Logo>
          <img src="logo-simpson.svg" alt="E-LISA Simpson" />
        </Logo>
        {!showLoader && (
          <MainContent>
            <Title>
              Connect your wallet to AI agent
              <br />
              <span className="highlight">without exposing</span> your{" "}
              <span className="highlight">Private Keys</span>
            </Title>

            <Subtitle className="text-slate-50/[80%]">
              Delegate tasks securely to AI agents while keeping your private
              keys private
            </Subtitle>

            <ButtonContainer>
              <PrimaryButton
                text="Connect wallet"
                onClick={() => handleConnect()}
                keyShortcut="⌘C"
                keyEvent="Command+C"
              />
            </ButtonContainer>
          </MainContent>
        )}
      </ContentWrapper>

      <LisaCharacter />
      <SpeechBubble>
        <p>Private keys? I won't need yours.</p>
      </SpeechBubble>

      <BottomBackground>
        <img src="bottom-bg.svg" />
      </BottomBackground>
    </LandingContainer>
  );
};

export default Landing;
