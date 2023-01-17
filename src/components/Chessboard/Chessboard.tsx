import React, { useRef, useState } from 'react';
import Tile from "../Tile/Tile";
import "./Chessboard.css";
import Referee from '../../referee/Referee';

const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];
const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];

export enum PieceType {
    PAWN,
    BISHOP,
    KNIGHT,
    ROOK,
    QUEEN,
    KING
}

export enum TeamType {
    OPPONENT,
    OUR
}

export interface Piece {
    image: string;
    x: number;
    y: number;
    type: PieceType;
    team: TeamType;
}

const initialBoardState: Piece[] = [];

for (let p = 0; p < 2; p++) {
    const teamType = (p === 0) ? TeamType.OPPONENT : TeamType.OUR;
    const type = (teamType === TeamType.OPPONENT) ? "l" : "d";
    const y = (teamType === TeamType.OPPONENT) ? 0 : 7;

    initialBoardState.push({ image:`assets/images/Chess_r${type}t60.png`, x:7, y , type:PieceType.ROOK, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_r${type}t60.png`, x:0, y , type:PieceType.ROOK, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_n${type}t60.png`, x:6, y , type:PieceType.KNIGHT, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_n${type}t60.png`, x:1, y , type:PieceType.KNIGHT, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_b${type}t60.png`, x:5, y , type:PieceType.BISHOP, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_b${type}t60.png`, x:2, y , type:PieceType.BISHOP, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_q${type}t60.png`, x:3, y , type:PieceType.QUEEN, team:teamType})
    initialBoardState.push({ image:`assets/images/Chess_k${type}t60.png`, x:4, y , type:PieceType.KING, team:teamType})
}

for (let i = 0; i < 8; i++) {
    initialBoardState.push({image:"assets/images/Chess_plt60.png", x:i, y:1, type:PieceType.PAWN, team:TeamType.OUR})
    initialBoardState.push({image:"assets/images/Chess_pdt60.png", x:i, y:6, type:PieceType.PAWN, team:TeamType.OPPONENT})
}
export default function Chessboard() {
    const referee = new Referee();
    const [activePiece, setActivePiece] = useState<HTMLElement | null>(null)
    const [gridX, setGridX] = useState(0)
    const [gridY, setGridY] = useState(0)
    const [pieces, setPieces] = useState<Piece[]>(initialBoardState)

    const chessboardRef = useRef<HTMLDivElement>(null);

    function grabPiece(e: React.MouseEvent) {
        // console.log(e.target)
        const chessboard = chessboardRef.current
        const element = e.target as HTMLElement;
        if (element.classList.contains("chess-piece") && chessboard) {
            const gridX = Math.floor((e.clientX - chessboard.offsetLeft)/100);
            const gridY = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800)/100));
            setGridX(gridX);
            setGridY(gridY);
            const x = e.clientX - 55;
            const y = e.clientY - 55;
            element.style.position = "absolute";
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
            setActivePiece(element);
        }
    }

    function movePiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current
        if (activePiece && chessboard) {
            const minX = chessboard.offsetLeft - 30;
            const minY = chessboard.offsetTop - 25;
            const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
            const maxY = chessboard.offsetTop + chessboard.clientHeight - 80;
            const x = e.clientX - 55;
            const y = e.clientY - 55;
            activePiece.style.position = "absolute";
            activePiece.style.left = `${x}px`;
            activePiece.style.top = `${y}px`;

            activePiece.style.left = (x < minX) ? `${minX}px` : (x > maxX) ? `${maxX}px` : `${x}`;
            activePiece.style.top = (y < minY) ? `${minY}px` : (y > maxY) ? `${maxY}px` : `${y}`;
        }
    }

    function dropPiece(e: React.MouseEvent) {
        const chessboard = chessboardRef.current;
        if (activePiece && chessboard) {
            setPieces((value) => {

                const x = Math.floor((e.clientX - chessboard.offsetLeft)/100);
                const y = Math.abs(Math.ceil((e.clientY - chessboard.offsetTop - 800)/100));
                const pieces = value.map(p => {
                    if (p.x === gridX && p.y === gridY) {
                        const validMove = referee.idValidMove(gridX, gridY, x, y, p.type, p.team, value);
                        if (validMove) {
                            p.x = x;
                            p.y = y;
                        }
                        else {
                            activePiece.style.position = "relative";
                            activePiece.style.removeProperty("top");
                            activePiece.style.removeProperty("left");
                        }
                    }
                    return p;
                });
                return pieces;
            });
            if (activePiece) {
                setActivePiece(null);
            }
        }
    }

    let board = [];
    for (let i = verticalAxis.length - 1; i >= 0; i--) {
        for (let j = 0; j < horizontalAxis.length; j++) {
            let number = i + j + 2;
            let image = undefined;
            initialBoardState.forEach(p => {
                if (p.x === j && p.y === i) {
                    image = p.image;
                }
            });
            board.push(<Tile key={`${i}${j}`} image={image} number={number}/>);
        }
    }
    return (
        <div 
        onMouseUp={e=>dropPiece(e)} 
        onMouseMove={e=>movePiece(e)} 
        onMouseDown={e => grabPiece(e)} 
        id="chessboard"
        ref={chessboardRef}>{board}</div>
    )
}
