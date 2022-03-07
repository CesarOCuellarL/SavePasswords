import i18next from '../../config/localization/i18n';
import { useState, useEffect } from 'react';
import Avatar from "../avatar";
import { supabase } from '../../config/supabase';
import styled from 'styled-components';
import {BotonDisminuir,BotonIncrementar,BotonCheck, BotonGenerar} from '../botones';
import generarPassword from '../../funciones/generarpassword';
import CryptoJS from "crypto-js";
import validator from "validator";

export default function Account({ session }) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState(null)
    const [website, setWebsite] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)
    const [isFetch, setIsFetch] = useState(false);
    const [passwordID, setPasswordID] = useState(null);
    const [userid] = useState(supabase.auth.user());
    const [listPassword,setListPassword]=useState(null);
    const [site, setSite] = useState(null);
    const [password, setPassword] = useState(null);
    const[passwordGenerada,cambiarPasswordGenerada]= useState(' ');
    const [errorMessage, setErrorMessage] = useState('')
    const [configuracion,cambiarConfiguracion] = useState({
        numeroDeCaracteres:8,
        simbolos: true,
        numeros: true,
        mayusculas: true,
      });
       const validate = (value) => {
  
         if (validator.isStrongPassword(value, {
           minLength: 8, minLowercase: 1,
           minUppercase: 1, minNumbers: 1, minSymbols: 1
         })) {
           setErrorMessage(i18next.t("error1"))
         } else {
           setErrorMessage(i18next.t("error2"))
         }
       }
    let key = 'generadorpassword@utags.edu.mx';  
    useEffect(() => {
        if (avatar_url) downloadImage(avatar_url)
        getProfile()
        listrecord()
    }, [session, avatar_url, isFetch])


    async function downloadImage(path) {
        try {
            const {  error } = await supabase.storage.from('avatars').download(path)
            if (error) {
                throw error
            }

        } catch (error) {
            console.log('Error downloading image: ', error.message)
        }
    }
    async function getProfile() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.username)
                setWebsite(data.website)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function deleteRecord() {
        try {
            const { error } = await supabase
                .from('Password')
                .delete()
                .eq('id', passwordID)
            if (error) {
                throw error
            } else {
                setIsFetch(true);
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setIsFetch(false);
        }
    }


    async function updateProfile({ username, website, avatar_url }) {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            const updates = {
                id: user.id,
                username,
                website,
                avatar_url,
                updated_at: new Date(),
            }

            let { error } = await supabase.from('profiles').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                throw error
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function insertRecord({ site, password }) {
        if (passwordID !== null && passwordID !== "") {
            updateReminder();
        } else {
            try {
                const updates = {
                    user: userid.id,
                    site,
                    password,
                    created_at: new Date(),
                }
                let { error } = await supabase.from('Password').insert(updates, {
                    returning: 'minimal', // Don't return the value after inserting
                })

                if (error) {
                    throw error
                } else {
                    setIsFetch(true);
                }
            } catch (error) {
                alert(error.message)
            } finally {
                setIsFetch(false);
            }
        }

    }

    async function updateReminder() {
        try {

            const user = userid

            const updates = {
                id: passwordID,
                user: user.id,
                site: site,
                password: password
            }

            let { error } = await supabase.from('Password').upsert(updates, {
                returning: 'minimal', // Don't return the value after inserting
            })

            if (error) {
                throw error
            } else {
                setIsFetch(true);
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setIsFetch(false);
        }
    }
    async function listrecord() {
        try {
            setLoading(true)
            const user = supabase.auth.user()

            let { data, error, status } = await supabase
                .from('Password')
                .select(`*`)
                .eq('user', user.id)


            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setListPassword(data);
            }
        } catch (error) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function getRecord() {
        try {

            let { data, error, status } = await supabase
                .from('Password')
                .select(`*`)
                .eq('id', passwordID)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setSite(data.site);
                setPassword(data.password);
            }
        } catch (error) {
            alert(error.message)
        } finally {

        }
    }

    function changeLanguage(){
        let actual=localStorage.getItem('i18nextLng')
        localStorage.setItem('i18nextLng', actual==="es" ? "en":"es");
        window.location.reload(false);
    }

    const incrementarNumeroCaracteres =()=>{
        if(configuracion.numeroDeCaracteres <16){
        cambiarConfiguracion((configurcionAnterior)=>{
          const NuevaConfiguracion ={...configurcionAnterior}
          NuevaConfiguracion.numeroDeCaracteres +=1;
          return NuevaConfiguracion;
        });
      }
      };
    
      const disminuirNumeroCaracteres =()=>{
        if(configuracion.numeroDeCaracteres >8){
          cambiarConfiguracion((configurcionAnterior)=>{
            const NuevaConfiguracion ={...configurcionAnterior}
            NuevaConfiguracion.numeroDeCaracteres -=1;
            return NuevaConfiguracion;
          });
        }
        
      };
    
      const toggleSimbolos=()=>{
        cambiarConfiguracion((configurcionAnterior)=>{
          const NuevaConfiguracion ={...configurcionAnterior}
          NuevaConfiguracion.simbolos= !NuevaConfiguracion.simbolos;
          return NuevaConfiguracion;
        });
      };
    
      const toggleNumeros=()=>{
        cambiarConfiguracion((configurcionAnterior)=>{
          const NuevaConfiguracion ={...configurcionAnterior}
          NuevaConfiguracion.numeros= !NuevaConfiguracion.numeros;
          return NuevaConfiguracion;
        });
      };
    
      const toggleMayusculas=()=>{
        cambiarConfiguracion((configurcionAnterior)=>{
          const NuevaConfiguracion ={...configurcionAnterior}
          NuevaConfiguracion.mayusculas = !NuevaConfiguracion.mayusculas;
          return NuevaConfiguracion;
        });
      };
    
      const onSubmit =(e)=>{
        e.preventDefault();
        cambiarPasswordGenerada(generarPassword(configuracion))
        validate(passwordGenerada)
        setPassword(CryptoJS.AES.encrypt(passwordGenerada, key).toString()) 
      };

    return (
        <div className="form-widget">



            <h1>{i18next.t("title1")}</h1>


            <Avatar
                url={avatar_url}
                size={150}
                onUpload={(url) => {
                    setAvatarUrl(url)
                    updateProfile({ username, website, avatar_url: url })
                }}
            />


            <div>
                <label htmlFor="email">{i18next.t("field1")}</label>
                <input id="email" type="text" value={session.user.email} disabled />
            </div>
            <div>
                <label htmlFor="username">{i18next.t("field2")}</label>
                <input
                    id="username"
                    type="text"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="website">{i18next.t("field3")}</label>
                <input
                    id="website"
                    type="website"
                    value={website || ''}
                    onChange={(e) => setWebsite(e.target.value)}
                />
            </div>

            <div>
                <button
                    className="button block primary"
                    onClick={() => updateProfile({ username, website, avatar_url })}
                    disabled={loading}>
                    {loading ? 'Loading ...' : i18next.t("button2")}
                </button>
            </div>

            <div>
                <button className="button block" onClick={() => supabase.auth.signOut()}>
                    {i18next.t("button3")}
                </button>
            </div>

            <h1>{i18next.t("field8")}</h1>
            <div className='contenedor'>
      <form onSubmit={onSubmit}>
        <Fila>
          <label>{i18next.t("field4")}</label>
          <Controles>
            <BotonDisminuir click={disminuirNumeroCaracteres}></BotonDisminuir>
            <span>{configuracion.numeroDeCaracteres}</span>
            <BotonIncrementar click={incrementarNumeroCaracteres}></BotonIncrementar>
          </Controles>
        </Fila>
        <Fila>
          <label>{i18next.t("field5")}</label>
          <BotonCheck seleccionado={configuracion.simbolos} click={toggleSimbolos}></BotonCheck>
        </Fila>
        <Fila>
          <label>{i18next.t("field6")}</label>
          <BotonCheck seleccionado={configuracion.numeros} click={toggleNumeros}></BotonCheck>
        </Fila>
        <Fila>
          <label>{i18next.t("field7")}</label>
          <BotonCheck seleccionado={configuracion.mayusculas} click={toggleMayusculas}></BotonCheck>
        </Fila>
        <Fila>
          <label>{i18next.t("field10")}</label>
          <Input id="site" type="text" onChange={(e) => setSite(e.target.value)}></Input>
        </Fila>
        <Fila>
            <label>{i18next.t("field11")}</label>
            <Input id="password" type="text" onChange={(e) => setSite(e.target.value)} value={passwordGenerada}></Input>
            <label>{i18next.t("field13")} {errorMessage}</label>
        </Fila>
        <Fila>
            <BotonGenerar></BotonGenerar>
        </Fila>
        
        </form>
    </div>    
        <div >
                <label htmlFor="idfield">id</label>
                <input id="idfield" type="text" onChange={(e) => setPasswordID(e.target.value)} />

                <button className="button primary block" onClick={() => getRecord()}>{i18next.t("button4")}</button>
            </div>

            <button
                className="button block primary"
                onClick={() => insertRecord({ site, password})}
            >
                {passwordID !== null && passwordID !== "" ? i18next.t("button5v2") : i18next.t("button5")}
            </button>
           <button
                className="button block primary"
                onClick={() => deleteRecord()}
            >
                {i18next.t("button6")}
            </button>

            <h1>{i18next.t("field9")}</h1>
            {listPassword!== null ? listPassword.map((t) => <li key={t.id}> {i18next.t("record1")} {t.id} {i18next.t("record2")} {t.site} - {i18next.t("record3")} {configuracion.show=true ? t.password : CryptoJS.DES.decrypt(t.password, key).toString(CryptoJS.enc.Utf8) } - </li>):""}
            <div>
                <button className="button primary block"  onClick={() => changeLanguage()} >{i18next.t("lan")}</button>
            </div>
        </div>
    )
}

const Fila =styled.div`
margin-bottom: 40px;
	display: grid;
	grid-template-columns: 1fr 1fr;
  gap:10px;
`
const Controles = styled.div`
  display: flex;
  justify-content: space-between;
  text-aling: center;

  & > *{
    flex: 1;
  }
  span{
    line-height: 40px;
    background: #fff;
    color: black;
    
  }
`;

const Input = styled.input`
  width: 100%;
  background: none;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255, .25);
  color: #fff;
  height: 40px
  line-heigth: 40px;
  cursor: pointer;
  transition: all .3s ease;

  &:hover {
    border: 1px solid rgba(255,255,255, .50);
  }
  &::selection {
    background: #212159;
  }

  &::-moz-selection {
    backgrond: #212159;
  }
`;