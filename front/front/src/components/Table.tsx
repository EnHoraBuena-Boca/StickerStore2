import { DataGrid } from "@mui/x-data-grid";
import type { GridRowSelectionModel } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import { ApproveCards, DeleteCards } from "./CardApi.ts";
import Alert from "@mui/material/Alert";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useGlobalContext } from "../utils/ContextProvider";

import * as React from "react";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 130 },
  { field: "cardtype", headerName: "Type", width: 130 },
  { field: "approved", headerName: "Approved", width: 130 },
];

interface Image {
  id: number;
  name: string;
  cardtype: string;
  approved: string;
}

interface TableProps {
  rows: Image[];
}

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable({ rows }: TableProps) {
  const [rowSelectionModel, setRowSelectionModel] =
    React.useState<GridRowSelectionModel>({ type: "include", ids: new Set() });
  const [submit, setSubmit] = React.useState(false);
  const [destroy, setDestroy] = React.useState(false);

  const [error, setError] = React.useState(false);
  const [allRowIds, setAllRowIds] = React.useState<number[]>([]);
  const { user } = useGlobalContext();

  const darkTheme = createTheme({ palette: { mode: "dark" } });
  const handleApprove = () => {
    ApproveCards(
      rowSelectionModel.ids.size == 0 ? allRowIds : rowSelectionModel.ids
    ).then((result: any) => {
      if (result) {
        window.location.reload();
      } else {
        setError(true);
      }
    });
  };

  const handleDestroy = () => {
    DeleteCards(
      rowSelectionModel.ids.size == 0 ? allRowIds : rowSelectionModel.ids
    ).then((result: any) => {
      if (result) {
        window.location.reload();
      } else {
        setError(true);
      }
    });
  };

  React.useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [error]);

  const rowSelectionModelChange = (newRowSelectionModel: any) => {
    setRowSelectionModel(newRowSelectionModel);
    if (newRowSelectionModel.ids.size > 0) {
      setSubmit(true);
      setDestroy(true);
    } else if (newRowSelectionModel.type === "exclude") {
      const addAllRowIds = rows.map((row) => row.id);
      setAllRowIds(addAllRowIds);
      setSubmit(true);
      setDestroy(true);
    } else {
      setSubmit(false);
      setDestroy(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Paper sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onRowSelectionModelChange={rowSelectionModelChange}
          rowSelectionModel={rowSelectionModel}
          sx={{ border: 0 }}
        />
        {submit && user != "moderator" && (
          <Button variant="contained" onClick={handleApprove}>
            Submit for Approval
          </Button>
        )}
        {destroy && user != "moderator" && (
          <Button variant="contained" onClick={handleDestroy}>
            Submit to Destroy
          </Button>
        )}
        {error && <Alert severity="error">Server error, contact admin</Alert>}
      </Paper>
    </ThemeProvider>
  );
}
