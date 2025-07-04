import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  IconButton,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chat: any) => void;
}

const UserSearchDialog: React.FC<Props> = ({ open, onClose, onChatCreated }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (search.trim().length < 2) return;

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/users?search=${search}`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleChatStart = async (userId: string) => {
    try {
      const { data } = await API.post("/chats", { userId }, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      onChatCreated(data);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Search Users</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {loading ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
          }}
        />
        <List>
          {results.map(u => (
            <ListItem button key={u._id} onClick={() => handleChatStart(u._id)}>
              <ListItemText primary={u.name} secondary={u.email} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
