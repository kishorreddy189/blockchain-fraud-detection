"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3"; // Import Web3.js
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { contractAbi, contractAddress } from "./constant";

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [votingStatus, setVotingStatus] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState("");
  const [CanVote, setCanVote] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await getCandidates();
      await getCurrentStatus();
    };
    fetchData();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  async function vote() {
    if (web3) {
      const accounts = await web3.eth.requestAccounts();
      const account = accounts[0];
      const contractInstance = new web3.eth.Contract(
        contractAbi,
        contractAddress
      );

      if (number !== "") {
        const tx = await contractInstance.methods
          .vote(number)
          .send({ from: account });
         await tx.wait();
        canVote();
      } else {
        console.error("Invalid number provided for voting");
      }
    }
  }

  async function canVote() {
    if (web3) {
      const accounts = await web3.eth.requestAccounts();
      const account = accounts[0];
      const contractInstance = new web3.eth.Contract(
        contractAbi,
        contractAddress
      );
      const voteStatus = await contractInstance.methods.voters(account).call();
      setCanVote(voteStatus);
    }
  }

  async function getCandidates() {
    if (web3) {
      try {
        const accounts = await web3.eth.requestAccounts();
        const account = accounts[0];
        const contractInstance = new web3.eth.Contract(
          contractAbi,
          contractAddress
        );
        const candidatesList = await contractInstance.methods
          .getAllVotesOfCandiates()
          .call();

        const formattedCandidates = candidatesList.map((candidate, index) => {
          return {
            index: index,
            name: candidate.name,
            voteCount:
              typeof candidate.voteCount === "object"
                ? candidate.voteCount.toNumber()
                : candidate.voteCount,
          };
        });

        setCandidates(formattedCandidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    }
  }

  async function getCurrentStatus() {
    if (web3) {
      const accounts = await web3.eth.requestAccounts();
      const account = accounts[0];
      const contractInstance = new web3.eth.Contract(
        contractAbi,
        contractAddress
      );
      const status = await contractInstance.methods.getVotingStatus().call();
      setVotingStatus(status);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length > 0 && account !== accounts[0]) {
      setAccount(accounts[0]);
      canVote();
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  }

  async function connectToMetamask() {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        const accounts = await web3.eth.requestAccounts();
        const address = accounts[0];
        setAccount(address);
        console.log("Metamask Connected: " + address);
        setIsConnected(true);
        canVote();
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("Metamask is not detected in the browser");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center my-3">
      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Vote.</TabsTrigger>
          <TabsTrigger value="password">Result</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card className="w-[350px] my-1">
            <CardHeader>
              <CardTitle>Block-Vote🌐</CardTitle>
              <CardDescription>
                Blockchain-based voting system🔗🔗🔗🔗 note : you can vote only
                once.⚠️ ⚠️
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="index">Candidates index (0-4) 💬 </Label>
                    <Input
                      type="number"
                      id="index"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      min="0"
                      max="4"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              {!isConnected ? (
                <Button className="w-full" onClick={connectToMetamask}>
                  Connect with Metamask
                </Button>
              ) : (
                <Button className="w-full" onClick={vote}>
                  Vote🪙
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card className="w-[350px] my-1">
            <CardHeader>
              <CardTitle>Vote-Info🌐</CardTitle>
              <CardDescription>Get your voting info here 🔗</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Vote Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow
                      key={candidate.index}
                      style={{ maxHeight: "15px" }}
                    >
                      <TableCell>{candidate.name}</TableCell>
                      <TableCell>{Number(candidate.voteCount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              {!isConnected ? (
                <Button className="w-full" onClick={connectToMetamask}>
                  Connect with Metamask
                </Button>
              ) : (
                <Button className="w-full" onClick={getCandidates}>
                  show
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
