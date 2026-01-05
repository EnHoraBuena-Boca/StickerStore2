import { AnimatePresence, motion } from "motion/react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {cld} from "./lib/cloudinary.ts";
import Box from "@mui/material/Box";
import { PackCards } from "./components/PackApi.ts";
import * as React from "react";

import {
  AdvancedImage,
  placeholder,
} from "@cloudinary/react";

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: 100,
  height: 160,
  position: "relative",
};

const box: React.CSSProperties = {
  width: 100,
  height: 100,
  backgroundColor: "#0cdcf7",
  borderRadius: "10px",
};

const button: React.CSSProperties = {
  backgroundColor: "#0cdcf7",
  borderRadius: "10px",
  padding: "10px 20px",
  color: "#0f1115",
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
};

export default function PackPage() {
  const [submit, setSubmit] = React.useState(false);
  const [isVisible0, setIsVisible0] = React.useState(false);
  const [isVisible1, setIsVisible1] = React.useState(false);
  const [isVisible2, setIsVisible2] = React.useState(false);
  const [isVisible3, setIsVisible3] = React.useState(false);
  const [isVisible4, setIsVisible4] = React.useState(false);
  const [cardPublicIds, setCardPublicIds] = React.useState<string[]>([]);
  const [imageLoaded, setImageLoaded] = React.useState(false);


  const handleClick = async () => {
    const result = await PackCards();
    setCardPublicIds(result);
    setSubmit(true);
  };

  const images = cardPublicIds.map((id) => cld.image(id));

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "auto auto",
          gap: 2,
          justifyContent: "center",
          width: "100vw",
        }}
      >
        {!submit && (
          <motion.div
            style={{
              width: 150,
              height: 100,
              borderRadius: 5,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            <Button variant="contained" onClick={handleClick}>
              Open Pack
            </Button>
          </motion.div>
        )}
        {submit && (
          <Grid
            container
            spacing={4}
            sx={{ width: "100vw", height: "50vh" }}
            justifyContent="center"
            alignItems="center"
          >
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {isVisible0 ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
                      style={box}
                    >
                      <AdvancedImage
                        height="200px"
                        cldImg={images[0]}
                        plugins={[placeholder({ mode: "blur" })]}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!isVisible0 ? (
                  <motion.button
                    style={button}
                    onClick={() => setIsVisible0(!isVisible0)}
                    whileTap={{ y: 1 }}
                  >
                    {isVisible0 ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>

            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {isVisible1 ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
                      style={box}
                    >
                      <AdvancedImage
                        height="200px"
                        cldImg={images[1]}
                        plugins={[placeholder({ mode: "blur" })]}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!isVisible1 ? (
                  <motion.button
                    style={button}
                    onClick={() => setIsVisible1(!isVisible1)}
                    whileTap={{ y: 1 }}
                  >
                    {isVisible1 ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {isVisible2 ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
                      style={box}
                    >
                      <AdvancedImage
                        height="200px"
                        cldImg={images[2]}
                        plugins={[placeholder({ mode: "blur" })]}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!isVisible2 ? (
                  <motion.button
                    style={button}
                    onClick={() => setIsVisible2(!isVisible2)}
                    whileTap={{ y: 1 }}
                  >
                    {isVisible2 ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {isVisible3 ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
                      style={box}
                    >
                      <AdvancedImage
                        height="200px"
                        cldImg={images[3]}
                        plugins={[placeholder({ mode: "blur" })]}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!isVisible3 ? (
                  <motion.button
                    style={button}
                    onClick={() => setIsVisible3(!isVisible3)}
                    whileTap={{ y: 1 }}
                  >
                    {isVisible3 ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {isVisible4 ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={imageLoaded ? { scale: 1, opacity: 1 } : {}}
                      style={box}
                    >
                      <AdvancedImage
                        height="200px"
                        cldImg={images[4]}
                        plugins={[placeholder({ mode: "blur" })]}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!isVisible4 ? (
                  <motion.button
                    style={button}
                    onClick={() => setIsVisible4(!isVisible4)}
                    whileTap={{ y: 1 }}
                  >
                    {isVisible4 ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
}
