import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import ScaleIcon from "@mui/icons-material/Scale";
import React from "react";

const SizeCard = ({ sizeRange, totalGems, totalWeight, metaData }) => {
  return (
    <Card elevation={3} className="rounded-xl h-76">
      <CardHeader
        title={sizeRange}
        className="!bg-gray-200 !text-black !py-2 !px-4"
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "bold" }}
      />
      <CardContent className="pb-2">
        <div className="items-center mb-2">
          <Typography
            variant="body1"
            className="items-center font-semibold"
          >
            <DiamondIcon
              className="mr-1 text-[var(--brand-purple)]"
              fontSize="small"
            />
            Total Gems: {totalGems}
          </Typography>
          <Typography
            variant="body1"
            className="items-center font-semibold"
          >
            <ScaleIcon
              className="mr-1 text-[var(--brand-gold)]"
              fontSize="small"
            />
            Total Weight: {totalWeight}
          </Typography>
        </div>

        <Table size="small">
          <TableHead>
            <TableRow style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
              <TableCell className="font-bold">Size</TableCell>
              <TableCell className="font-bold">Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ display: 'block', maxHeight: 120, overflowY: 'auto' }}>
            {metaData?.map((item, idx) => (
              <TableRow key={idx} style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                <TableCell>{item.size.trim()}</TableCell>
                <TableCell>{item.diamondQuantity.trim()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SizeCard;
