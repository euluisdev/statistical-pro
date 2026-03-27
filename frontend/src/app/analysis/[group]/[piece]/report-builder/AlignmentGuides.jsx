export default function AlignmentGuides({ guides, canvasW, canvasH }) {
  if (!guides || guides.length === 0) return null;

  return (
    <>
      {guides.map((g, i) => {
        if (g.orientation === "v") {
          //linha vertical
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left:   `${g.position}px`,
                top:    `${g.start}px`,
                width:  "1px",
                height: `${g.end - g.start}px`,
                background: "#9b59b6",
                pointerEvents: "none",
                zIndex: 9999,
                boxShadow: "0 0 2px rgba(155,89,182,0.6)",
              }}
            />
          );
        } else {
          //linha horizontal
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top:    `${g.position}px`,
                left:   `${g.start}px`,
                height: "1px",
                width:  `${g.end - g.start}px`,
                background: "#9b59b6",
                pointerEvents: "none",
                zIndex: 9999,
                boxShadow: "0 0 2px rgba(155,89,182,0.6)",
              }}
            />
          );
        }
      })}
    </>
  );
}  
 
 