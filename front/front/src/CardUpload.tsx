import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";

import * as React from "react";
import Table from "./components/Table.tsx";
import { createCard } from "./components/CardApi.ts";
import { UnapprovedCards } from "./components/CardApi.ts";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface Image {
  id: number;
  name: string;
  Cardtype: string;
  approved: string;
}

export default function BasicTextFields() {
  const [type, setAge] = React.useState("");
  const [rows, setRows] = React.useState<Image[]>([]);
  const [resetFile, setResetFile] = React.useState(0);
  const [cardName, setcardName] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [semisuccess, setsemiSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  const addRow = (newImage: Image) => {
    setRows((prev) => [...prev, newImage]);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value as string);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const raw = new FormData(event.currentTarget);
    createCard(raw)
      .then((result: any) => {
        if (result.approved) {
          setSuccess(true);
        } else {
          addRow({
            id: result.id,
            name: result.name,
            Cardtype: result.Cardtype,
            approved: result.approved,
          });
          setsemiSuccess(true);
        }
      })
      .catch(() => {
        setError(true);
      });

    setAge("");
    setcardName("");
    setResetFile((reset) => reset + 1);
  };
 
  React.useEffect(() => {
    UnapprovedCards().then((result: any) => {
      setRows(result.all_cards);
    });
  }, []);
 
  React.useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [success]);

  React.useEffect(() => {
    if (!semisuccess) return;

    const timer = setTimeout(() => {
      setsemiSuccess(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [semisuccess]);
  React.useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateRows: "auto auto",
          gap: 2,
          justifyContent: "center",
          width: "100vw",
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="CardName"
            label="Card Name"
            value={cardName}
            fullWidth
            onChange={(event) => setcardName(event.target.value)}
            variant="standard"
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              name="type"
              value={type}
              label="Type"
              onChange={handleChange}
            >
              <MenuItem value={"Common"}>Common</MenuItem>
              <MenuItem value={"Uncommon"}>Uncommon</MenuItem>
              <MenuItem value={"Rare"}>Rare</MenuItem>
            </Select>
          </FormControl>
          <Button
            component="label"
            role={undefined}
            variant="contained"
            sx={{ justifySelf: "center", width: "50ch" }}
          >
            File
            <VisuallyHiddenInput
              key={resetFile}
              type="file"
              name="file"
              multiple
            />
          </Button>
        </Box>
        <Button type="submit" sx={{ marginBottom: 10 }}>
          Upload
        </Button>
        <Table rows={rows} />
        {success && <Alert severity="success">Success!.</Alert>}
        {semisuccess && (
          <Alert severity="warning">Success but needs approval.</Alert>
        )}
        {error && <Alert severity="error">Server error, contact admin</Alert>}
      </Box>
    </>
  );
}
