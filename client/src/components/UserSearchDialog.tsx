import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { useSearchUsersQuery, useCreateChatMutation } from '../store/services/chatApi';

interface Props {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chat: any) => void;
}

const UserSearchDialog: React.FC<Props> = ({ open, onClose, onChatCreated }) => {
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading } = useSearchUsersQuery(search, { skip: !search });
  const [createChat] = useCreateChatMutation();

  const handleChatStart = async (userId: string) => {
    try {
      const data = await createChat({ userId }).unwrap();
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
                {isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
          }}
        />
        <List>
          {users.map(u => (
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
