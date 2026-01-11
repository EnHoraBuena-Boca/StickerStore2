import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Alert from "@mui/material/Alert";

import * as React from "react";
import Table from "./components/Table.tsx";
import { createCard } from "./components/CardApi.ts";
import { UnapprovedCards } from "./components/CardApi.ts";

const Div = styled("div")(({ theme }) => ({
  ...theme.typography.button,
  backgroundColor: (theme.vars || theme).palette.background.paper,
  padding: theme.spacing(1),
  textTransform: "lowercase",
  textAlign: "center"
}));

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
  cardtype: string;
  approved: string;
}

export default function BasicTextFields() {
  const [rows, setRows] = React.useState<Image[]>([]);
  const [resetFile, setResetFile] = React.useState(0);
  const [success, setSuccess] = React.useState(false);
  const [semisuccess, setsemiSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);

  const addRow = (newImage: Image) => {
    setRows((prev) => [...prev, newImage]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if ((event.target as HTMLFormElement).file.value.endsWith(".zip")) {
      const raw = new FormData(event.currentTarget);

      createCard(raw)
        .then((result: any) => {
          for (let file of result) {
            if (file.approved) {
              setSuccess(true);
            } else {
              addRow({
                id: file.id,
                name: file.name,
                cardtype: file.cardtype,
                approved: file.approved,
              });
              setsemiSuccess(true);
            }
          }
        })
        .catch(() => {
          setError(true);
        });

      setResetFile((reset) => reset + 1);
    } else {
      setError(true);
    }
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
        <Div>{"Submit a zip file, all images must be first_last-type-season.png"}</Div>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          sx={{ alignSelf: "center", justifySelf: "center", width: "70ch" }}
        >
          File
          <VisuallyHiddenInput
            key={resetFile}
            type="file"
            name="file"
            accept=".zip,application/zip"
          />
        </Button>
        <Button type="submit" sx={{ marginBottom: 10 }}>
          Upload
        </Button>
        <Table rows={rows} />
        {success && <Alert severity="success">Success!</Alert>}
        {semisuccess && (
          <Alert severity="warning">Success but needs approval.</Alert>
        )}
        {error && (
          <Alert severity="error">
            Error, wrong input file or server error
          </Alert>
        )}
      </Box>
    </>
  );
}
