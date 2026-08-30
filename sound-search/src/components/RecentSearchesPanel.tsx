import { Paper, Typography, List, ListItemButton, ListItemText, Box } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { customColors } from "../theme/theme";

interface RecentSearchesPanelProps {
  searches: string[];
  onSelect: (term: string) => void;
}

export function RecentSearchesPanel({ searches, onSelect }: RecentSearchesPanelProps) {
  return (
    <Paper
      component="section"
      aria-labelledby="recent-searches-heading"
      elevation={0}
      sx={{ p: { xs: 2, md: 2.5 }, height: "100%" }}
    >
      <Typography
        id="recent-searches-heading"
        variant="overline"
        sx={{ color: "text.secondary", mb: 1.5, display: "block" }}
      >
        Recent Searches
      </Typography>

      {searches.length === 0 ? (
        <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">
            Your last few searches will show up here.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {searches.map((term) => (
            <ListItemButton
              key={term}
              onClick={() => onSelect(term)}
              sx={{ borderRadius: 1.5, mb: 0.5 }}
            >
              <HistoryIcon
                fontSize="small"
                sx={{ color: customColors.textMuted, mr: 1.5 }}
              />
              <ListItemText primary={term} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}
