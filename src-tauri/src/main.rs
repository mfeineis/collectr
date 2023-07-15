// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::PathBuf};

use itertools::Itertools;
use lazy_static::lazy_static;
use regex::Regex;
use tauri::Manager;

lazy_static! {
    static ref RE_EXTRACT_ARTIST: Regex =
        Regex::new(r"^([^(]+)\s+-\s+\(\s*(?:[\d]+\s*-\s*)?([\d]+)\s*\)\s+-\s+(.+)$").unwrap();
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(serde::Serialize)]
struct Artist {
    id: String,
    name: String,
    albums: Vec<Album>,
}

#[derive(serde::Serialize)]
struct Album {
    id: String,
    name: String,
    path: String,
    year: Option<i32>,
}

fn make_id(s: &str) -> String {
    s.chars().map(|it| match it {
        ' ' => '_',
        '/' => '_',
        '(' => '_',
        ')' => '_',
        _ => it.to_ascii_lowercase(),
    }).collect()
}

fn from_pathbuf(pathbuf: &PathBuf) -> (Artist, Album) {
    let full_path = pathbuf.as_path();
    let file_name = full_path.file_name().unwrap().to_str().unwrap();
    let album_id = make_id(file_name);

    let mut artist_name = file_name;
    let mut album_name = file_name;
    let mut album_year: Option<i32> = None;

    for (_, [art_name, alb_year, alb_name]) in RE_EXTRACT_ARTIST
        .captures_iter(file_name)
        .map(|c| c.extract()) {
        artist_name = art_name;
        album_name = alb_name;
        album_year = alb_year.parse().ok();

        break;
    }

    ( Artist {
        id: String::from(make_id(artist_name)),
        name: String::from(artist_name),
        albums: vec![],
      }
    , Album {
        id: album_id,
        name: String::from(album_name),
        path: String::from(full_path.to_str().unwrap()),
        year: album_year,
      }
    )
}


#[tauri::command]
fn find_artists(dir: &str) -> Vec<Artist> {
    if let Ok(entry) = fs::read_dir(dir) {
        let grouping = entry.into_iter()
            .filter(|it| it.is_ok())
            .map(|it| it.unwrap().path())
            .filter(|it| it.is_dir())
            .filter(|it| !it.file_name().unwrap().to_str().unwrap().starts_with("."))
            .map(|it| from_pathbuf(&it))
            .group_by(|(art, _)| art.id.clone());

        grouping.into_iter()
            .map(|(_, g)| {
                let group: Vec<(Artist, Album)> = g.collect();
                let (artist, _) = group.first().unwrap();

                let id = artist.id.clone();
                let name = artist.name.clone();

                let albums = group.into_iter().map(|(_, alb) | alb);
                Artist {
                    id,
                    name,
                    albums: albums.collect(),
                }
            })
            .collect()
    } else {
        vec![]
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, find_artists])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
