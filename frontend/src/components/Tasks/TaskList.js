import React from 'react';
import Typography from '@mui/material/Typography';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { makeStyles } from "@material-ui/core/styles";
import { MdModeEdit, MdDelete } from "react-icons/md";
import io from 'socket.io-client';

export const socket = io('http://localhost:3002');

const useStyles = makeStyles({
    custom: {
        color: "#00EE00",
        fontWeight: "bold"
    },
    actionIcons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    },
    deleteIcon: {
        color: '#ff0000',
        cursor: 'pointer'
    },
    editIcon: {
        color: '#0000ff',
        cursor: 'pointer'
    }
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function TaskList({ setLoggedIn }) {
    const [tasks, setTasks] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);
    const [title, setTitle] = React.useState("");
    const navigate = useNavigate();
    const classes = useStyles();

    const addMatch = React.useCallback(
        (task) => setTasks([task,...tasks]),
        [tasks]
    );

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:3002/api/v1/task', {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });
            setTasks(data);
        } catch (error) {
            setLoggedIn(true);
        }
    };

    React.useEffect(() => {
        fetchTasks();
    }, [navigate, setLoggedIn]);

    React.useEffect(() => {
        socket.on('newMatch', addMatch);
        return () => {
            socket.off('newMatch', addMatch);
        };
    }, [addMatch]);

    const [titleName, settitle] = React.useState({
        title: "",
        id: "",
        description: "",
        cat: ""
    });

    const handleClick = (e) => {
        const { id, alt } = e.target;
        setOpen(true);
        settitle({
            id: id,
            title: alt,
            description: "",
            cat: ""
        });
    };

    const handleDelete = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3002/api/v1/task/${taskId}`, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            });
            // Update the tasks list after deletion
            setTasks(tasks.filter(task => task._id !== taskId));
        } catch (error) {
            console.error('Error deleting task:', error);
            // You might want to show an error message to the user here
        }
    };

    const [cat, setcat] = React.useState('');
    const handleChange = (event) => {
        setcat(event.target.value);
    };

    const submitForm = async (e) => {
        e.preventDefault();
        const data1 = new FormData(e.currentTarget);
        const form = {
            title: data1.get('title'),
            id: data1.get('id'),
            description: data1.get('description'),
            cat: data1.get('cat'),
        };
        const token = localStorage.getItem('token');
        await axios.put("http://localhost:3002/api/v1/task/" + titleName.id, form, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });
        await fetchTasks();
        handleClose();
    };

    return (
        <Container>
            <div>
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            <Box component="form" onSubmit={submitForm} noValidate sx={{ mt: 1 }}>
                                <label>Title:</label>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="title"
                                    name="title"
                                    autoFocus
                                    placeholder={titleName.title}
                                    onChange={(e) => setTitle(titleName.title)}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="id"
                                    name="id"
                                    autoFocus
                                    style={{ display: 'none' }}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <label>description</label>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth 
                                    id="description" 
                                    name="description"
                                    autoFocus
                                    placeholder={titleName.description}
                                    onChange={(e) => setTitle(titleName.description)}
                                />
                                <label>Category</label>
                                <Select
                                    required
                                    fullWidth
                                    id="cat"
                                    name="cat"
                                    label="cat" 
                                    autoFocus 
                                    value={cat} 
                                    onChange={handleChange}
                                >
                                    <MenuItem value={"Client visit"}>Client visit</MenuItem>
                                    <MenuItem value={"Project meet"}>Project meet</MenuItem>
                                    <MenuItem value={"Code Review"}>Code Review</MenuItem>
                                </Select>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Update task
                                </Button>
                            </Box>
                        </Typography>
                    </Box>
                </Modal>
            </div>

            <Grid container spacing={2} marginTop={2}>
                {tasks.map((task) => (
                    <Grid item xs={12} md={4} key={task._id}>
                        <CardActionArea>
                            <Card sx={{ display: 'flex' }}>
                                <CardContent sx={{ flex: 1 }}>
                                    <div className={classes.actionIcons}>
                                        <MdModeEdit 
                                            className={classes.editIcon}
                                            id={task._id} 
                                            alt={task.title} 
                                            name={task.description} 
                                            cat={task.cat} 
                                            onClick={handleClick}
                                        />
                                        <MdDelete 
                                            className={classes.deleteIcon}
                                            onClick={() => handleDelete(task._id)}
                                        />
                                    </div>
                                    <Typography 
                                        id="outlined-helperText" 
                                        variant="h6" 
                                        className={classes.custom} 
                                        component="div" 
                                        color="text.secondary"
                                    >
                                        {task.title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.primary">
                                        {task.description}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        {task.cat}
                                    </Typography>
                                </CardContent>
                                <CardMedia>
                                    <Button 
                                        variant="contained" 
                                        href={`http://127.0.0.1:3002/${task.filename}`} 
                                        rel="noopener noreferrer" 
                                        target='_blank'
                                    >
                                        Download
                                    </Button>
                                </CardMedia>
                            </Card>
                        </CardActionArea>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}