import {Link, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {setAccessToken} from "../utils/helper.ts";
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import getUrls from "../utils/config.ts";
import {useAuth} from "../../context/AuthContext.tsx";
import Swal from "sweetalert2";
import socket from "../../socket.ts";

interface UserState {
    username: string;
    password: string;
}

export default function SignIn() {
    const navigate = useNavigate();
    const {isAuth, login, serverUrl} = useAuth();

    const [userState, setUserState] = useState({
        username: '',
        password: ''
    });
    useEffect(() => {
        const token = localStorage.getItem('app_token');
        if (token) {
            navigate('/');
        }

        // get token from url
        const urlParams = new URLSearchParams(window.location.search);
        const _token = urlParams.get('token');
        console.log('url', urlParams);
        console.log('token', _token);
        if (_token) {
            const id = urlParams.get('id') || "";
            const username = urlParams.get('username') || "";
            const user = {
                id: parseInt(id),
                username: username
            };
            console.log('user', user);

            login(_token, user);
            navigate('/', {replace: true, state: {from: '/signin'}});
        }

    }, []);

    
    const handleInputChange = (name: string) => (e: any) => {
        setUserState({
            ...userState,
            [name]: e.target.value
        });
    };

    const handleSignIn = async () => {
        const {username, password} = userState;
        const body: UserState = {
            username,
            password
        };
        // validate
        if (!username || !password) {
            console.error("All fields are required");
            return;
        }

        try {
            const hasSignIn = await fetchHasSingIn();
            if(hasSignIn){
                const button = await Swal.fire({
                    title: 'คุณได้เข้าสู่ระบบอยู่แล้ว',
                    text: 'คุณต้องการออกจากระบบหรือไม่?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: `ออกจากระบบ`,
                    cancelButtonText: `ยกเลิก`
                });
                if (button.isConfirmed) {
                    const signOut = await fetchSignOut();
                }else{
                    return;
                }
            }
            const data = await fetchSignIn(body);
            const {token, user} = data;
            if (token !== undefined) {
                login(token, user);
                await Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ',
                    timer: 1500
                });
                setTimeout(() => {
                    socket.emit('signed-in', {username: userState.username});
                    navigate('/', {replace: true, state: {from: '/signin'}});
                }, 400);

            }

        } catch (e: any) {
            Swal.fire({
                icon: 'error',
                title: 'เข้าสู่ระบบไม่สำเร็จ',
                text: e.message,
                timer: 3000
            });
        }
    };

    const fetchSignIn = async (body: UserState) => {

        const url = `${serverUrl}/api/auth/sign-in`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) {
            const message = `${data.message}`;
            throw new Error(message);
        }
        return data;
    };

    const fetchHasSingIn = async () => {
        const url = `${serverUrl}/api/auth/has-sign-in/${userState.username}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        // console.log('data', response.status);
        return response.status === 200;
    };

    const fetchSignOut = async () => {
       socket.emit('sign-out', {username: userState.username});
    };

    useEffect(() => {
        const signIn = document.querySelector('.sign-in');
        signIn?.classList.add('d-none');
        return () => {
            signIn?.classList.remove('d-none');
        }
    }, []);

    const handleOAuth = () => {
        window.open(`${serverUrl}/api/auth/google`, "_self");
    };

    return (
        <>
            <div className="container d-flex justify-content-between align-items-center mt-2">
                <div>

                </div>
                <div>
                    <Link to='/' className="btn btn-primary">
                        <i className="bi bi-house-door-fill"/> กลับหน้าหลัก</Link>
                </div>
            </div>

            <section className="py-3 py-md-5 py-xl-8 d-flex justify-content-center align-items-center">
                <div className="container">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                            <div className="card card-lg">
                                <div className="card-body">
                                    <div className="text-center">
                                        <h1 className="display-5 mb-2">เข้าสู่ระบบ</h1>
                                        <p className="text-muted">----------</p>
                                    </div>
                                    <form>
                                        <div className="form-group">
                                            <label>ชื่อผู้ใช้</label>
                                            <input type="username" className="form-control" placeholder="ชื่อผู้ใช้"
                                                   onChange={handleInputChange("username")}/>
                                        </div>
                                        <div className="form-group">
                                            <label>รหัสผ่าน</label>
                                            <input type="password" className="form-control" placeholder="รหัสผ่าน"
                                                   onChange={handleInputChange("password")} autoComplete={"off"}/>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-3">

                                            {/*<a className={"text-muted"} href="#">Forgot password?</a>*/}
                                            <div></div>
                                            <Link className="nav-link " to="/signup"> ไม่มีบัญชีใช่หรือไม่? <span
                                                className="text-primary">สมัครสมาชิก</span></Link>
                                        </div>
                                        <div>
                                            <button type="button" className="btn btn-primary mt-2"
                                                    onClick={handleSignIn}>เข้าสู่ระบบ
                                            </button>
                                        </div>
                                        <hr/>
                                        <div className="mt-4 text-center">
                                            <div className="signin-other-title">
                                                <h5 className="fs-13 mb-2 title">เข้าสู่ระบบด้วย</h5>
                                            </div>
                                            <div>
                                                <button type="button" onClick={handleOAuth}
                                                        className="btn btn-danger btn-icon waves-effect waves-light"><i
                                                    className="ri-google-fill fs-16"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}