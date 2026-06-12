import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import { Link } from "react-router-dom";
import { useGlobalContext } from "../utils/ContextProvider.tsx";
export default function StickerNavigation() {
  const { auth } = useGlobalContext();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {auth && (
        <>
          <Button
            component={Link}
            to="/MyFolder"
            variant="text"
            size="small"
            sx={{ height: "100%", color: "#ffffff" }}
          >
            My Stickers
          </Button>
          <Button
            component={Link}
            to="/PackPage"
            variant="text"
            size="small"
            sx={{ height: "100%", color: "#ffffff" }}
          >
            Open Packs
          </Button>
        </>
      )}
    </Box>
  );
}
