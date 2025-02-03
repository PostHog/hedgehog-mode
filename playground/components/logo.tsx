const H = `
  (_)         (_)  
  (_)         (_)  
  (_)         (_)  
  (_) _  _  _ (_)  
  (_)(_)(_)(_)(_)  
  (_)         (_)  
  (_)         (_)  
  (_)         (_)  
`;

const E = `
   _  _  _  _  _   
  (_)(_)(_)(_)(_)  
  (_)              
  (_) _  _         
  (_)(_)(_)        
  (_)              
  (_) _  _  _  _   
  (_)(_)(_)(_)(_)  
`;

const D = `
   _  _  _  _      
  (_)(_)(_)(_)     
   (_)      (_)_   
   (_)        (_)  
   (_)        (_)  
   (_)       _(_)  
   (_)_  _  (_)    
  (_)(_)(_)(_)     
`;

const G = `
      _  _  _      
   _ (_)(_)(_) _   
  (_)         (_)  
  (_)    _  _  _   
  (_)   (_)(_)(_)  
  (_)         (_)  
  (_) _  _  _ (_)  
     (_)(_)(_)(_)  
`;

const O = `
     _  _  _  _    
   _(_)(_)(_)(_)_  
  (_)          (_) 
  (_)          (_) 
  (_)          (_) 
  (_)          (_) 
  (_)_  _  _  _(_) 
    (_)(_)(_)(_)   
                   
    `;
const M = `          
   _           _   
  (_) _     _ (_)  
  (_)(_)   (_)(_)  
  (_) (_)_(_) (_)  
  (_)   (_)   (_)  
  (_)         (_)  
  (_)         (_)  
  (_)         (_)  
`;

type Box = {
  x: number;
  y: number;
};

const generateBoxes = (text: string): Box[] => {
  const lines = text.split("\n");
  const boxes: Box[] = [];

  lines.forEach((line, y) => {
    line.split("").forEach((char, x) => {
      if (char === "_") {
        boxes.push({ x, y });
      }
    });
  });
  return boxes;
};

const ROW_LENGTH = 20;
const ROW_HEIGHT = 8;

export const Row = ({
  word,
  style,
}: {
  word: Box[][];
  style: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 100,
        width: "100%",
        ...style,
      }}
    >
      {word.map((letter, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: `${(index / word.length) * 80 + 10}%`,
            width: 100,
            height: 100,
          }}
        >
          {letter.map((box, index) => (
            <div
              key={index}
              className="border rounded"
              style={{
                position: "absolute",
                borderColor: "rgb(245 78 0)",
                backgroundColor: "rgb(245 78 0)",
                left: `${(box.x / ROW_LENGTH) * 80}%`,
                top: `${(box.y / ROW_HEIGHT) * 100}%`,
                width: `${(100 / ROW_LENGTH) * 2}%`,
                height: `${100 / ROW_HEIGHT}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const Logo = () => {
  // For each letter we generate a matrix of boxes.
  // All _ are a box, everythig else is empty.

  const _ = {
    H: generateBoxes(H),
    E: generateBoxes(E),
    D: generateBoxes(D),
    G: generateBoxes(G),
    O: generateBoxes(O),
    M: generateBoxes(M),
  };

  return (
    <div className="flex-1 relative" style={{ backgroundColor: "#eeefe9" }}>
      <Row word={[_.H, _.E, _.D, _.G, _.E]} style={{ top: "15%" }} />
      <Row word={[_.H, _.O, _.G]} style={{ top: "40%" }} />
      <Row word={[_.M, _.O, _.D, _.E]} style={{ top: "65%" }} />
    </div>
  );
};
