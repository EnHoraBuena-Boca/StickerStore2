import { AnimatePresence, motion } from "motion/react";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { cld } from "./lib/cloudinary.ts";
import Box from "@mui/material/Box";
import { PackCards, CommitCards } from "./api/PackApi.ts";
import * as React from "react";
import Alert from "@mui/material/Alert";

import { AdvancedImage, placeholder } from "@cloudinary/react";
import { center } from "@cloudinary/url-gen/qualifiers/textAlignment";

const container: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: 100,
  height: 160,
  position: "relative",
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

async function getPackCards(): Promise<string[]> {
  const result = await PackCards();
  return result;
}
async function commitPackCards(ids: string[]) {
  const result = await CommitCards(ids);
  return result;
}

export default function PackPage() {
  const [submit, setSubmit] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState<boolean[]>(
    Array(5).fill(false)
  );
  const [cardPublicIds, setCardPublicIds] = React.useState<string[]>([]);
  const [success, setSuccess] = React.useState(0);

  React.useEffect(() => {
    const data = getPackCards();
    data.then((result) => {
      setCardPublicIds(result);
    });
  }, []);

  const handleClick = async () => {
    setSubmit(true);
    const status = commitPackCards(cardPublicIds);
    status.then((result) => {
      if (result == 200) {
        setSuccess(1);
      } else {
        setSuccess(2);
      }
    });
  };

  const images = React.useMemo(() => {
    return cardPublicIds.map((card) =>
      cld.image(card).quality("auto").format("auto")
    );
  }, [cardPublicIds]);

  React.useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess(0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [success]);
  return (
    <>
      {!submit && (
        <motion.div
          style={{
            width: 150,
            height: 100,
            borderRadius: 5,
            justifySelf: "center",
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
        >
          <Button variant="contained" onClick={handleClick}>
            Open Pack
          </Button>
        </motion.div>
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          alignItems: "center",
          width: "100vw",
        }}
      >
        {submit &&
          images.map((id, index) => (
            <Grid
              display="flex"
              justifyContent="center"
              alignItems="center"
              size="grow"
            >
              <div style={container}>
                <AnimatePresence initial={false}>
                  {isVisible[index] ? (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.5,
                        ease: [0, 0.71, 0.2, 1.01],
                      }}
                    >
                      <AdvancedImage
                        rel="preload"
                        height="200px"
                        cldImg={id}
                        plugins={[placeholder({ mode: "blur" })]}
                      />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                {!isVisible[index] ? (
                  <motion.button
                    style={button}
                    onClick={() =>
                      setIsVisible((prev) =>
                        prev.map((v, i) => (i === index ? !v : v))
                      )
                    }
                    whileTap={{ y: 1 }}
                  >
                    {isVisible[index] ? "Hide" : "Show"}
                  </motion.button>
                ) : null}
              </div>
            </Grid>
          ))}
      </Box>
      {success == 1 && (
        <Alert severity="success" sx={{ mt: 20, justifySelf: center }}>
          Success, cards saved into folder!
        </Alert>
      )}
      {success == 2 && (
        <Alert severity="error" sx={{ mt: 20, justifySelf: center }}>
          Error, contact admin
        </Alert>
      )}
    </>
  );
}
